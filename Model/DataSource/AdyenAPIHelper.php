<?php


namespace Koene\AdyenGraphQl\Model\DataSource;

use http\Exception\RuntimeException;

class AdyenAPIHelper
{
    /**
     * @var string
     */
    private $apiKey;

    public const ADYEN_API_HOST = 'https://checkout-test.adyen.com/v64';

    public const METHOD_POST = 'POST';
    public const METHOD_GET = 'GET';

    public function __construct(
        \Adyen\Payment\Helper\Data $adyenHelper
    )
    {
        $this->apiKey = $adyenHelper->getAPIKey();
    }

    /**
     * @param string $uri
     * @param string $method
     * @param array $body
     * @return bool|string
     */
    public function callApi($uri, $method, $body) {
        // Validate the necessary arguments
        if ($uri[0] !== '/') {
            throw new \InvalidArgumentException('URI should start with \'/\'!');
        }

        $req = curl_init();

        // Set URL which is base/$uri
        curl_setopt($req, CURLOPT_URL, AdyenAPIHelper::ADYEN_API_HOST.$uri);
        switch($method) {
            case AdyenAPIHelper::METHOD_POST:
                curl_setopt($req, CURLOPT_POST, true);
                break;
            case AdyenAPIHelper::METHOD_GET:
                // Default is GET
                break;
            default:
                throw new \InvalidArgumentException('The method you provided is invalid for fetching data with this helper.');
        }

        // Set headers
        curl_setopt($req, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-Requested-With: XMLHttpRequest',
            "X-API-Key: $this->apiKey"
        ]);

        // Set the body and return transfer
        curl_setopt($req, CURLOPT_POSTFIELDS, json_encode($body));
        curl_setopt($req, CURLOPT_RETURNTRANSFER, true);

        // Fetch data
        $result = curl_exec($req);

        // If curl exception - throw it
        if (curl_error($req)) {
            throw new \RuntimeException(curl_error($req));
        }

        return $result;
    }
}
