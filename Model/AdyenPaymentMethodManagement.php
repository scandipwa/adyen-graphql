<?php


namespace Koene\AdyenGraphQl\Model;


use Adyen\Payment\Helper\Data;
use Elasticsearch\Common\Exceptions\RuntimeException;
use Koene\AdyenGraphQl\Api\AdyenPaymentMethodManagementInterface;
use Koene\AdyenGraphQl\Model\DataSource\AdyenAPIHelper;
use Magento\Customer\Model\Session;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlNoSuchEntityException;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Api\Data\CartInterface;
use Magento\Quote\Model\Quote;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Authorization\Model\UserContextInterface;

class AdyenPaymentMethodManagement implements AdyenPaymentMethodManagementInterface
{
    /**
     * @var AdyenAPIHelper
     */
    private $APIHelper;

    /**
     * @var Data
     */
    private $adyenHelper;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var GetCartForUser
     */
    private $getCartForUser;

    /**
     * @var CartManagementInterface
     */
    private $cartManagement;

    /**
     * @var UserContextInterface
     */
    private $userContext;

    public function __construct(
        AdyenAPIHelper $APIHelper,
        Data $adyenHelper,
        StoreManagerInterface $storeManager,
        GetCartForUser $getCartForUser,
        CartManagementInterface $cartManagement,
        UserContextInterface $userContext
    )
    {
        $this->APIHelper = $APIHelper;
        $this->adyenHelper = $adyenHelper;
        $this->storeManager = $storeManager;
        $this->getCartForUser = $getCartForUser;
        $this->cartManagement = $cartManagement;
        $this->userContext = $userContext;
    }

    /**
     * @param $storeId
     * @param string $guestCartId
     * @return CartInterface|Quote
     * @throws GraphQlAuthorizationException
     * @throws GraphQlNoSuchEntityException
     * @throws NoSuchEntityException
     */
    public function getQuote($guestCartId = '') {
        $storeId = $this->storeManager->getStore()->getId();
        $customerId = $this->userContext->getUserId();

        if (!$customerId) {
            return $this->getCartForUser->execute($guestCartId, $customerId, $storeId);
        } else {
            return $this->cartManagement->getCartForCustomer($customerId);
        }
    }

    /**
     * @param string $guestCartId
     * @return bool|mixed|string|array
     * @throws GraphQlAuthorizationException
     * @throws NoSuchEntityException
     */
    public function getPaymentMethods($guestCartId = '')
    {
        $storeId = $this->storeManager->getStore()->getId();
        $quote = $this->getQuote($guestCartId);
        $currencyCode = $quote->getCurrency()->getQuoteCurrencyCode();

        $merchantAccount = $this->adyenHelper->getAdyenAbstractConfigData('merchant_account', $storeId);

        if (!$currencyCode) {
            throw new \RuntimeException('No currency code has been provided for an Adyen payment!');
        }

        return $this->APIHelper->callApi(
            '/paymentMethods',
            $this->APIHelper::METHOD_POST,
            [
                'countryCode' => $quote->getShippingAddress()->getCountryModel()->getCountryId(),
                'amount' => [
                    'currency' => $currencyCode,
                    'value' => $this->adyenHelper->formatAmount(
                        $quote->getGrandTotal(),
                        $currencyCode
                    )
                ],
                'merchantAccount' => $merchantAccount
            ]
        );
    }
}
