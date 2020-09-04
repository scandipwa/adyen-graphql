<?php
namespace Koene\AdyenGraphQl\Api;

interface AdyenPaymentMethodManagementInterface
{
    /**
     * @param string $guestCartId
     * @return mixed
     */
    public function getPaymentMethods($guestCartId = '');
}
