<?php


namespace Koene\AdyenGraphQl\Model;


use Adyen\AdyenException;
use Adyen\Client;
use Adyen\Environment;
use Adyen\Payment\Helper\Data;
use Adyen\Service\Checkout;
use Koene\AdyenGraphQl\Model\DataSource\AdyenAPIHelper;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlNoSuchEntityException;
use Magento\Store\Model\StoreManagerInterface;

class AdyenPaymentManagement implements \Koene\AdyenGraphQl\Api\AdyenPaymentManagementInterface
{
    /**
     * @var AdyenAPIHelper
     */
    private $APIHelper;

    /**
     * @var AdyenPaymentMethodManagement
     */
    private $adyenPaymentMethodManagement;

    /**
     * @var Data
     */
    private $adyenHelper;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    public function __construct(
        Data $adyenHelper,
        AdyenPaymentMethodManagement $adyenPaymentMethodManagement,
        AdyenAPIHelper $APIHelper,
        StoreManagerInterface $storeManager
    )
    {
        $this->adyenHelper = $adyenHelper;
        $this->adyenPaymentMethodManagement = $adyenPaymentMethodManagement;
        $this->APIHelper = $APIHelper;
        $this->storeManager = $storeManager;
    }

    protected function getEnvironment($storeId) {
        if ($this->adyenHelper->isDemoMode($storeId)) {
            return Environment::TEST;
        }

        return Environment::LIVE;
    }

    /**
     * @inheritDoc
     * @throws AdyenException
     * @throws NoSuchEntityException
     * @throws GraphQlAuthorizationException
     * @throws GraphQlNoSuchEntityException
     */
    public function makeIdealPayment($idealStateData, $guestCartId = '')
    {
        if (!isset($idealStateData['paymentMethod'])) {
            return null;
        }

        $store = $this->storeManager->getStore();
        $quote = $this->adyenPaymentMethodManagement->getQuote($guestCartId);

        $quote->reserveOrderId();

        $adyenClient = new Client();
        $adyenClient->setEnvironment($this->getEnvironment($store->getId()));
        $adyenClient->setXApiKey($this->adyenHelper->getAPIKey());
        $service = new Checkout($adyenClient);

        $currencyCode = $quote->getCurrency()->getQuoteCurrencyCode();
        $params = [
            'amount' => [
                'currency' => $currencyCode,
                'value' => $this->adyenHelper->formatAmount(
                    $quote->getGrandTotal(),
                    $currencyCode
                ),
                'reference' => $quote->getReservedOrderId(),
                'paymentMethod' => $idealStateData['paymentMethod'],
                'returnUrl' => $store->getBaseUrl(),
                'merchantAccount' => $this->adyenHelper->getAdyenAbstractConfigData('merchant_account', $store->getId())
            ]
        ];

        return $service->payments($params);

        // TODO save action.paymentData
    }
}
