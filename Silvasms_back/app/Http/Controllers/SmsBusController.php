<?php

namespace App\Http\Controllers;

use App\Models\PurchasedNumber;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\SmsBusService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class SmsBusController extends Controller
{
    protected SmsBusService $smsBus;

    public function __construct(SmsBusService $smsBus)
    {
        $this->smsBus = $smsBus;
    }

    /**
     * Get all available countries
     */
    public function getCountries(): JsonResponse
    {
        $result = $this->smsBus->getCountries();

        return response()->json($result);
    }

    /**
     * Get all available services (projects)
     */
    public function getServices(): JsonResponse
    {
        $result = $this->smsBus->getServices();

        return response()->json($result);
    }

    /**
     * Get prices for a given country with markup applied
     */
    public function getPrices(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'country_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $result = $this->smsBus->getPrices((int) $request->country_id);

        if ($result['data']['country_id'] == 5 && $result['data']['code'] == 'wa')
        {
            
        }

        return response()->json($result);
    }

    /**
     * Purchase a USA number for a given project/service
     */
    public function purchaseNumber(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|integer',
            'country_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 400);
        }

        $projectId = (int) $request->project_id;
        $countryId = (int) $request->country_id;
        $user = User::where('id', auth()->id())->lockForUpdate()->first();

        try {
            DB::beginTransaction();

            Log::info('SmsBus: starting number purchase', [
                'user_id'    => $user->id,
                'project_id' => $projectId,
            ]);

            // Resolve marked-up cost for this project from the prices API
            $pricesResult = $this->smsBus->getPrices($countryId);

            if (!$pricesResult['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Unable to fetch service pricing',
                    'error'   => $pricesResult['error'] ?? 'Unknown error',
                ], 400);
            }

            $projectPrice = collect($pricesResult['data'])->firstWhere('project_id', $projectId);

            if (!$projectPrice) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Service not available for the selected country',
                ], 400);
            }

            $finalAmount   = (float) $projectPrice['cost'];
            $serviceTitle  = $projectPrice['title'];
            $serviceCode   = $projectPrice['code'];

            // Check balance before making the API call
            if (!$user->hasSufficientBalance($finalAmount)) {
                DB::rollBack();
                return response()->json([
                    'success'   => false,
                    'message'   => 'Insufficient balance',
                    'required'  => $finalAmount,
                    'available' => $user->balance,
                ], 400);
            }

            // Purchase the number
            $result = $this->smsBus->purchaseNumber($projectId, $countryId);

            if (!$result['success']) {
                DB::rollBack();
                Log::error('SmsBus: API failed to return a number', [
                    'user_id'    => $user->id,
                    'project_id' => $projectId,
                    'response'   => $result,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Failed to purchase number',
                    'error'   => $result['error'] ?? 'Unknown error',
                ], 400);
            }

            $expiresAt = now()->addMinutes(20);

            // Persist the purchase record
            $purchasedNumber = PurchasedNumber::create([
                'user_id'       => $user->id,
                'activation_id' => $result['request_id'],   // request_id = activation_id internally
                'phone_number'  => $result['number'],
                'service_code'  => $serviceCode,
                'service_id'    => $projectId,
                'cost'          => $finalAmount,
                'status'        => 'waiting',
                'expires_at'    => $expiresAt,
                'country_code'  => $countryId,
                'operator'      => 'any',
                'currency'      => 840,
                'provider'      => 'smsbus',
                'can_request_another_sms' => false,
                'daisy_service_name' => $serviceTitle,
            ]);

            // Deduct balance
            $user->deductBalance(
                $finalAmount,
                "Purchased number {$result['number']} for {$serviceTitle}",
                $purchasedNumber
            );

            DB::commit();

            Log::info('SmsBus: number purchased successfully', [
                'user_id'             => $user->id,
                'purchased_number_id' => $purchasedNumber->id,
                'request_id'          => $result['request_id'],
                'number'              => $result['number'],
                'cost'                => $finalAmount,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Number purchased successfully',
                'data'    => [
                    'purchased_number' => [
                        'id'           => $purchasedNumber->id,
                        'request_id'   => $purchasedNumber->activation_id,
                        'phone_number' => $purchasedNumber->phone_number,
                        'service'      => $serviceTitle,
                        'service_code' => $serviceCode,
                        'cost'         => $purchasedNumber->cost,
                        'status'       => $purchasedNumber->status,
                        'expires_at'   => $purchasedNumber->expires_at->toDateTimeString(),
                        'provider'     => 'smsbus',
                    ],
                    'balance' => [
                        'current' => $user->balance,
                    ],
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('SmsBus: exception during purchase', [
                'user_id'    => $user->id ?? null,
                'project_id' => $projectId,
                'error'      => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to purchase number',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Poll for the OTP code on a purchased number
     */
    public function getCode(int $id): JsonResponse
    {
        try {
            $user = auth()->user();

            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'smsbus')
                ->lockForUpdate()
                ->first();

            if (!$purchasedNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Number not found',
                ], 404);
            }

            // Already received — return cached code
            if ($purchasedNumber->status === 'received') {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'status'      => 'received',
                        'otp_code'    => $purchasedNumber->otp_code,
                        'received_at' => $purchasedNumber->code_received_at->toDateTimeString(),
                    ],
                ], 200);
            }

            // Terminal state — nothing to poll
            if (in_array($purchasedNumber->status, ['expired', 'cancelled', 'completed'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Activation is no longer active',
                    'status'  => $purchasedNumber->status,
                ], 400);
            }

            // Check expiry
            if ($purchasedNumber->isExpired()) {
                $updated = PurchasedNumber::where('id', $purchasedNumber->id)
                    ->where('status', 'waiting')
                    ->update(['status' => 'expired']);

                if ($updated) {
                    $user->addBalance(
                        $purchasedNumber->cost,
                        "Refund for expired number {$purchasedNumber->phone_number}",
                        'refund',
                        $purchasedNumber
                    );
                }

                return response()->json([
                    'success' => false,
                    'message' => 'Activation expired',
                    'status'  => 'expired',
                ], 400);
            }

            // Ask SmsBus for the SMS
            $result = $this->smsBus->getSms((int) $purchasedNumber->activation_id);

            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch SMS',
                    'error'   => $result['error'] ?? 'Unknown error',
                ], 400);
            }

            if ($result['status'] === 'waiting') {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'status'     => 'waiting',
                        'message'    => 'Waiting for OTP code',
                        'expires_at' => $purchasedNumber->expires_at->toDateTimeString(),
                    ],
                ], 200);
            }

            // Code received
            $purchasedNumber->markAsReceived($result['code']);

            return response()->json([
                'success' => true,
                'data'    => [
                    'status'      => 'received',
                    'otp_code'    => $result['code'],
                    'received_at' => $purchasedNumber->code_received_at->toDateTimeString(),
                ],
            ], 200);

        } catch (\Exception $e) {
            Log::error('SmsBus: exception in getCode', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get code',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mark a received activation as completed (no remote call — SmsBus auto-closes)
     */
    public function complete(int $id): JsonResponse
    {
        try {
            $user = auth()->user();

            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'smsbus')
                ->first();

            if (!$purchasedNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Number not found',
                ], 404);
            }

            if ($purchasedNumber->status !== 'received') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only complete activations with a received OTP',
                ], 400);
            }

            $purchasedNumber->markAsCompleted();

            return response()->json([
                'success' => true,
                'message' => 'Activation completed',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete activation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cancel a waiting activation and refund the user
     */
    public function cancel(int $id): JsonResponse
    {
        try {
            $user = auth()->user();

            $purchasedNumber = PurchasedNumber::where('id', $id)
                ->where('user_id', $user->id)
                ->where('provider', 'smsbus')
                ->first();

            if (!$purchasedNumber) {
                return response()->json([
                    'success' => false,
                    'message' => 'Number not found',
                ], 404);
            }

            if ($purchasedNumber->status === 'expired') {
                return response()->json([
                    'success' => false,
                    'message' => 'Number has expired and has already been refunded',
                ], 400);
            }

            if ($purchasedNumber->status !== 'waiting') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only cancel waiting activations',
                ], 400);
            }

            DB::beginTransaction();

            $result = $this->smsBus->cancelRequest((int) $purchasedNumber->activation_id);

            if (!$result['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to cancel activation',
                    'error'   => $result['error'] ?? 'Unknown error',
                ], 400);
            }

            $purchasedNumber->markAsCancelled();

            $user->addBalance(
                $purchasedNumber->cost,
                "Refund for cancelled number {$purchasedNumber->phone_number}",
                'refund',
                $purchasedNumber
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Activation cancelled and balance refunded',
                'data'    => [
                    'refunded_amount' => $purchasedNumber->cost,
                    'current_balance' => $user->balance,
                ],
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('SmsBus: exception in cancel', [
                'id'    => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel activation',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get SmsBus account balance (admin/debug use)
     */
    public function balance(): JsonResponse
    {
        return response()->json($this->smsBus->getBalance());
    }
}
