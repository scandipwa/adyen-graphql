<?php
/**
 * @category  Koene
 * @package   Koene_GraphQl
 * @author    Ivans Zuks <info@scandiweb.com>
 * @copyright Copyright (c) 2020 Scandiweb, Inc (https://scandiweb.com)
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */
declare(strict_types=1);

namespace Koene\AdyenGraphQl\Model;

use Adyen\Payment\Model\Ui\AdyenCcConfigProvider;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\QuoteGraphQl\Model\Cart\Payment\AdditionalDataProviderInterface;

/**
 * Format Klarna input into value expected when setting payment method
 */
class AdyenDataProvider implements AdditionalDataProviderInterface
{
    /**
     * Format Klarna input into value expected when setting payment method
     *
     * @param array $args
     * @return array
     * @throws GraphQlInputException
     */
    public function getData(array $args): array
    {
        if ($args['code'] === AdyenCcConfigProvider::CODE && !isset($args['additional_data'])) {
            throw new GraphQlInputException(
                __('Required parameter "additional_data" for "payment_method" (adyen) is missing.')
            );
        }

        return $args['additional_data'];
    }
}
