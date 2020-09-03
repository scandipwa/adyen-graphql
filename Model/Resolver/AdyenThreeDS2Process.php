<?php
/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Deniss Dubinins <denissd@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

declare(strict_types=1);

namespace Koene\AdyenGraphQl\Model\Resolver;

use Adyen\Payment\Helper\Data;
use Adyen\Payment\Logger\AdyenLogger;
use Adyen\Payment\Model\AdyenThreeDS2Process as ThreeDS2Process;
use Magento\Checkout\Model\Session;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\Resolver\ContextInterface;
use Magento\Framework\GraphQl\Query\Resolver\Value;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Sales\Model\OrderFactory;
use Magento\Sales\Model\Order;

class AdyenThreeDS2Process extends ThreeDS2Process implements ResolverInterface
{
    /**
     * @var Order
     */
    protected $order;

    /**
     * @var OrderFactory
     */
    protected $orderFactory;

    /**
     * AdyenThreeDS2Process constructor.
     *
     * @param Session $checkoutSession
     * @param Data $adyenHelper
     * @param OrderFactory $orderFactory
     * @param AdyenLogger $adyenLogger
     */
    public function __construct(
        Session $checkoutSession,
        Data $adyenHelper,
        OrderFactory $orderFactory,
        AdyenLogger $adyenLogger
    )
    {
        parent::__construct(
            $checkoutSession,
            $adyenHelper,
            $orderFactory,
            $adyenLogger
        );

        $this->orderFactory = $orderFactory;
    }

    /**
     * @param Field $field
     * @param ContextInterface $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return Value|mixed
     */
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ) {
        [ 'payload' => $payload, 'orderId' => $orderId ] = $args;

        $this->order = $this->orderFactory->create()->loadByIncrementId($orderId);

        $response = $this->initiate($payload);

        return json_decode($response);
    }

    /**
     * Get order object
     *
     * @return Order
     */
    protected function getOrder()
    {
        return $this->order ?? parent::getOrder();
    }
}
