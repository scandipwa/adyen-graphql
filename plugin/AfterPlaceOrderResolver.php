<?php
/**
 * @category  Koene
 * @package   Koene_AdyenGraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */
namespace Koene\AdyenGraphQl\plugin;

use Magento\Checkout\Model\Session;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\Sales\Model\Order;
use Magento\Framework\App\Config\ScopeConfigInterface;

class AfterPlaceOrderResolver
{
    protected const THREE_DS2_XML_PATH = 'payment/adyen_cc/threeds2_enabled';

    /**
     * @var Order
     */
    protected $order;

    /**
     * @var Session
     */
    protected $checkoutSession;

    /**
     * @var OrderRepositoryInterface
     */
    protected $orderRepository;

    /**
     * @var ScopeConfigInterface
     */
    protected $scopeConfig;

    /**
     * AfterPlaceOrderResolver constructor.
     * @param Order $order
     * @param Session $checkoutSession
     * @param OrderRepositoryInterface $orderRepository
     * @param ScopeConfigInterface $scopeConfig
     */
    public function __construct(
        Order $order,
        Session $checkoutSession,
        OrderRepositoryInterface $orderRepository,
        ScopeConfigInterface $scopeConfig
    ) {
        $this->order = $order;
        $this->checkoutSession = $checkoutSession;
        $this->orderRepository = $orderRepository;
        $this->scopeConfig = $scopeConfig;
    }

    public function afterResolve(\ScandiPWA\QuoteGraphQl\Model\Resolver\PlaceOrder $subject, $result)
    {
        /** @var Order $order */
        $order = $this->getOrder($result['order']['order_id']);

        $additionalInformation = $order
            ->getPayment()
            ->getAdditionalInformation();

        $fields = array_merge($this->getDefaultFields($order), $additionalInformation);

        $fields['threeDS2'] = $this->scopeConfig->getValue(self::THREE_DS2_XML_PATH);

        if (isset($additionalInformation['redirectUrl'])) {
            $fields['redirectUrl'] = $additionalInformation['redirectUrl'];
        }

        if (isset($additionalInformation['threeDS2Token'])) {
            $fields['token'] = $additionalInformation['threeDS2Token'];
        }

        if (isset($additionalInformation['threeDSType'])) {
            $fields['type'] = $additionalInformation['threeDSType'];
        }

        return ['order' => $fields];
    }

    /**
     * @param $order
     * @return array
     */
    protected function getDefaultFields($order) {
        return [
            'id' => $order->getId(),
            'order_id' => $order->getIncrementId()
        ];
    }

    /**
     * Get Last real order id
     *
     * @return Order
     */
    protected function getOrder($id) {
        return $this->order->loadByIncrementId($id);
    }
}
