<?php


namespace Koene\AdyenGraphQl\Model;


use Adyen\AdyenException;
use Adyen\Client;
use Adyen\Environment;
use Adyen\Payment\Helper\Data;
use Adyen\Service\Checkout;
use Koene\AdyenGraphQl\Api\AdyenPaymentManagementInterface;
use Koene\AdyenGraphQl\Model\DataSource\AdyenAPIHelper;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlNoSuchEntityException;
use Magento\Store\Model\StoreManagerInterface;

class AdyenPaymentManagement implements AdyenPaymentManagementInterface
{
    /**
     * @var AdyenAPIHelper
     */
    protected $APIHelper;

    /**
     * @var AdyenPaymentMethodManagement
     */
    protected $adyenPaymentMethodManagement;

    /**
     * @var Data
     */
    protected $adyenHelper;

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
            ],
            'reference' => $quote->getReservedOrderId(),
            'paymentMethod' => $idealStateData['paymentMethod'],
            'returnUrl' => join('/', [
                trim($store->getBaseUrl(), '/'),
                'adyenscandipwa/redirect/bank'
            ]),
            'merchantAccount' => $this->adyenHelper->getAdyenAbstractConfigData('merchant_account', $store->getId())
        ];

        $result = $service->payments($params);

        // Persist data for the Bank controller
        $_SESSION['adyen_storage'] = [
            'action' => $result['action']['paymentData'],
            'quoteId' => $quote->getId()
        ];

        return json_encode($result['action']);
    }
}
