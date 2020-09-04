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

use Adyen\AdyenException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Query\Resolver\ContextInterface;
use Magento\Framework\GraphQl\Query\Resolver\Value;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Adyen\Payment\Model\AdyenOriginKey;
use Magento\Store\Model\StoreManagerInterface;
use Magento\Framework\Locale\Resolver;
use Adyen\Payment\Helper\Data as Config;

class AdyenConfig implements ResolverInterface
{
    /** @var AdyenOriginKey */
    protected $adyenOriginKey;

    /** @var StoreManagerInterface */
    protected $storeManager;

    /** @var Resolver */
    protected $resolver;

    /** @var Config */
    protected $config;
    /**
     * @var Config
     */
    protected $adyenHelper;

    /**
     * @param AdyenOriginKey $adyenOriginKey
     * @param Config $adyenHelper
     * @param StoreManagerInterface $storeManager
     * @param Resolver $resolver
     * @param Config $config
     */
    public function __construct(
        AdyenOriginKey $adyenOriginKey,
        \Adyen\Payment\Helper\Data $adyenHelper,
        StoreManagerInterface $storeManager,
        Resolver $resolver,
        Config $config
    ) {
        $this->adyenOriginKey = $adyenOriginKey;
        $this->storeManager = $storeManager;
        $this->resolver = $resolver;
        $this->config = $config;
        $this->adyenHelper = $adyenHelper;
    }

    /**
     * @param Field $field
     * @param ContextInterface $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return array|Value|mixed
     * @throws NoSuchEntityException
     * @throws AdyenException
     */
    public function resolve(
        Field $field,
        $context,
        ResolveInfo $info,
        array $value = null,
        array $args = null
    ) {
        $storeId = $this->storeManager->getStore()->getId();
        $isDemo = $this->config->isDemoMode($storeId);

//        var_dump($this->adyenHelper->getAPIKey());
        return [
            'originKey' => $this->adyenOriginKey->getOriginKey(),
            'mode' => $isDemo ? $this->config::TEST : $this->config::LIVE,
            'locale' => $this->resolver->getLocale()
        ];
    }
}
