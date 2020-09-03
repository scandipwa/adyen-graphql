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

use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Adyen\Payment\Model\AdyenPaymentMethodManagement;
use Adyen\Payment\Model\GuestAdyenPaymentMethodManagement;
use Magento\Quote\Model\Webapi\ParamOverriderCartId;
use Magento\Quote\Api\Data\AddressInterfaceFactory;

class AdyenPaymentMethods implements ResolverInterface
{
    /** @var AdyenPaymentMethodManagement */
    protected $adyenPaymentMethodManagement;

    /** @var GuestAdyenPaymentMethodManagement */
    protected $guestAdyenPaymentMethodManagement;

    /** @var ParamOverriderCartId */
    protected $overriderCartId;

    /** @var AddressInterfaceFactory */
    protected $addressInterfaceFactory;

    /**
     * @param AdyenPaymentMethodManagement $adyenPaymentMethodManagment
     * @param GuestAdyenPaymentMethodManagement $guestAdyenPaymentMethodManagement
     * @param ParamOverriderCartId $overriderCartId
     * @param AddressInterfaceFactory $addressInterfaceFactory
     */
    public function __construct(
        AdyenPaymentMethodManagement $adyenPaymentMethodManagement,
        GuestAdyenPaymentMethodManagement $guestAdyenPaymentMethodManagement,
        ParamOverriderCartId $overriderCartId,
        AddressInterfaceFactory $addressInterfaceFactory
    ) {
        $this->adyenPaymentMethodManagement = $adyenPaymentMethodManagement;
        $this->guestAdyenPaymentMethodManagement = $guestAdyenPaymentMethodManagement;
        $this->overriderCartId = $overriderCartId;
        $this->addressInterfaceFactory = $addressInterfaceFactory;
    }

    /**
     * @param Field $field
     * @param $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return mixed
     * @throws NoSuchEntityException
     */
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ) {
        $shippingAddress = $this->addressInterfaceFactory->create([ 'data' => $args['shippingAddress'] ?? [] ]);

        return isset($args['guestCartId'])
            ? $this->guestAdyenPaymentMethodManagement->getPaymentMethods(
                $args['guestCartId'],
                $shippingAddress
            )
            : $this->adyenPaymentMethodManagement->getPaymentMethods(
                $this->overriderCartId->getOverriddenValue(),
                $shippingAddress
            );
    }
}
