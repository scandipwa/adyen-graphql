<?php
namespace Koene\AdyenGraphQl\Api;

interface AdyenPaymentManagementInterface
{
    /**
     * @param mixed $idealStateData
     * @param string $guestCartId
     * @return mixed
     */
    public function makeIdealPayment($idealStateData, $guestCartId = '');
}
