<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsBusService
{
    protected string $baseUrl = 'https://sms-bus.com/api/control';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.smsbus.key');
    }

    /**
     * Get all available countries
     */
    public function getCountries(): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/list/countries", [
                'token' => $this->apiKey,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                return $this->errorResponse($data);
            }

            $countries = [];
            foreach ($data['data'] as $item) {
                $countries[] = [
                    'id'    => $item['id'],
                    'code'  => $item['code'],
                    'title' => $item['title'],
                ];
            }

            return [
                'success' => true,
                'message' => 'Countries fetched successfully',
                'total'   => count($countries),
                'data'    => $countries,
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus getCountries error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get all available services (projects)
     */
    public function getServices(): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/list/projects", [
                'token' => $this->apiKey,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                return $this->errorResponse($data);
            }

            $services = [];
            foreach ($data['data'] as $item) {
                $services[] = [
                    'id'    => $item['id'],
                    'code'  => $item['code'],
                    'title' => $item['title'],
                ];
            }

            return [
                'success'  => true,
                'message'  => 'Services fetched successfully',
                'total'    => count($services),
                'data'     => $services,
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus getServices error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get prices and available number counts for a given country with markup applied
     */
    public function getPrices(int $countryId): array
    {
        try {
            // Fetch both in parallel
            $pricesResponse   = Http::timeout(30)->get("{$this->baseUrl}/list/prices", [
                'token'      => $this->apiKey,
                'country_id' => $countryId,
            ]);
            $projectsResponse = Http::timeout(30)->get("{$this->baseUrl}/list/projects", [
                'token' => $this->apiKey,
            ]);

            $pricesData   = $pricesResponse->json();
            $projectsData = $projectsResponse->json();

            if (!$this->isSuccess($pricesData)) {
                return $this->errorResponse($pricesData);
            }

            // Build a lookup map: project_id => [title, code]
            $projectMap = [];
            if ($this->isSuccess($projectsData)) {
                foreach ($projectsData['data'] as $project) {
                    $projectMap[(int) $project['id']] = [
                        'title' => $project['title'],
                        'code'  => $project['code'],
                    ];
                }
            }

            $excRate       = (float) service_settings()->sms_bus_exc_rate;
            $markupPercent = (float) service_settings()->sms_bus_top_up;

            $prices = [];
            foreach ($pricesData['data'] as $item) {
                $projectId    = (int) $item['project_id'];
                $originalCost = (float) $item['cost'];
                $markedUpCost = round(($originalCost * $excRate) + $markupPercent, 2);

                $prices[] = [
                    'project_id'    => $projectId,
                    'country_id'    => $item['country_id'] ?? $countryId,
                    'title'         => $projectMap[$projectId]['title'] ?? ($item['title'] ?? 'Unknown'),
                    'code'          => $projectMap[$projectId]['code']  ?? ($item['code']  ?? ''),
                    'original_cost' => $originalCost,
                    'cost'          => $markedUpCost,
                    'total_count'   => $item['total_count'] ?? 0,
                ];
            }

            return [
                'success' => true,
                'message' => 'Prices fetched successfully',
                'total'   => count($prices),
                'data'    => $prices,
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus getPrices error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Purchase a number for a given service (project) and country
     */
    public function purchaseNumber(int $projectId, int $countryId): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/get/number", [
                'token'      => $this->apiKey,
                'country_id' => $countryId,
                'project_id' => $projectId,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                return $this->errorResponse($data);
            }

            return [
                'success'    => true,
                'request_id' => $data['data']['request_id'],
                'number'     => $data['data']['number'],
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus purchaseNumber error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get SMS code for a purchased number
     */
    public function getSms(int $requestId): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/get/sms", [
                'token'      => $this->apiKey,
                'request_id' => $requestId,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                // 50101 = SMS not received yet (still waiting — not a fatal error)
                if (isset($data['code']) && $data['code'] === 50101) {
                    return [
                        'success' => true,
                        'status'  => 'waiting',
                        'code'    => null,
                    ];
                }

                return $this->errorResponse($data);
            }

            return [
                'success' => true,
                'status'  => 'received',
                'code'    => $data['data'],
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus getSms error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Cancel a number request
     */
    public function cancelRequest(int $requestId): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/cancel", [
                'token'      => $this->apiKey,
                'request_id' => $requestId,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                return $this->errorResponse($data);
            }

            return [
                'success' => true,
                'message' => 'Request cancelled successfully',
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus cancelRequest error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get account balance
     */
    public function getBalance(): array
    {
        try {
            $response = Http::timeout(30)->get("{$this->baseUrl}/get/balance", [
                'token' => $this->apiKey,
            ]);

            $data = $response->json();

            if (!$this->isSuccess($data)) {
                return $this->errorResponse($data);
            }

            return [
                'success' => true,
                'balance' => $data['data']['balance'],
                'frozen'  => $data['data']['frozen'],
            ];
        } catch (\Exception $e) {
            Log::error('SmsBus getBalance error: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Check if the API response indicates success
     */
    protected function isSuccess(?array $data): bool
    {
        return isset($data['code']) && $data['code'] === 200;
    }

    /**
     * Build a standardized error response from an API error payload
     */
    protected function errorResponse(?array $data): array
    {
        $errorMessages = [
            401   => 'Invalid API token',
            50001 => 'No service available',
            50002 => 'No number available',
            50101 => 'SMS not received yet',
            50102 => 'Number has been released or timed out',
            50103 => 'Cannot cancel — request already closed',
            50104 => 'Too many waiting requests, please complete or cancel one first',
            50201 => 'Insufficient balance',
            50208 => 'Account not activated — check your email for the activation link',
            50214 => 'Account blocked from ordering this service for 24 hours',
        ];

        $code    = $data['code'] ?? null;
        $message = $errorMessages[$code] ?? ($data['message'] ?? 'Unknown error');

        return [
            'success'      => false,
            'error_code'   => $code,
            'error'        => $message,
        ];
    }
}
