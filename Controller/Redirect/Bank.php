<?php


namespace Koene\AdyenGraphQl\Controller\Redirect;

use Adyen\Payment\Model\Ui\AdyenCcConfigProvider;
use Koene\AdyenGraphQl\Model\DataSource\AdyenAPIHelper;
use Magento\Authorization\Model\UserContextInterface;
use Magento\Framework\App\Action\Action;
use Magento\Framework\App\ResponseInterface;
use Magento\Framework\Exception\CouldNotSaveException;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Exception\NoSuchEntityException;
use Magento\Framework\GraphQl\Exception\GraphQlAuthorizationException;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Exception\GraphQlNoSuchEntityException;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Api\Data\CartInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\QuoteFactory;
use Magento\QuoteGraphQl\Model\Cart\CheckCartCheckoutAllowance;
use Magento\QuoteGraphQl\Model\Cart\SetPaymentMethodOnCart as SetPaymentMethodOnCartModel;
use Magento\Sales\Api\OrderRepositoryInterface;
use Magento\TestFramework\Event\Magento;

class Bank extends Action
{
    protected $resultFactory;

    /**
     * @var AdyenAPIHelper
     */
    protected $APIHelper;

    /**
     * @var CartRepositoryInterface
     */
    protected $quoteRepository;

    /**
     * @var SetPaymentMethodOnCartModel
     */
    protected $setPaymentMethodOnCart;

    /**
     * @var QuoteFactory
     */
    protected $quoteFactory;

    /**
     * @var CheckCartCheckoutAllowance
     */
    protected $checkCartCheckoutAllowance;

    /**
     * @var \Magento\Framework\App\Action\Context
     */
    protected $context;

    /**
     * @var UserContextInterface
     */
    protected $userContext;
    /**
     * @var CartManagementInterface
     */
    private $cartManagement;
    /**
     * @var OrderRepositoryInterface
     */
    protected $orderRepository;

    public function __construct(
        \Magento\Framework\Controller\ResultFactory $resultFactory,
        \Magento\Framework\App\Action\Context $context,
        AdyenAPIHelper $APIHelper,
        CartRepositoryInterface $quoteRepository,
        SetPaymentMethodOnCartModel $setPaymentMethodOnCart,
        QuoteFactory $quoteFactory,
        CheckCartCheckoutAllowance $checkCartCheckoutAllowance,
        UserContextInterface $userContext,
        CartManagementInterface $cartManagement,
        OrderRepositoryInterface $orderRepository
    )
    {
        $this->resultFactory = $resultFactory;
        $this->context = $context;
        $this->APIHelper = $APIHelper;
        $this->quoteRepository = $quoteRepository;
        $this->setPaymentMethodOnCart = $setPaymentMethodOnCart;
        $this->quoteFactory = $quoteFactory;
        $this->checkCartCheckoutAllowance = $checkCartCheckoutAllowance;
        $this->userContext = $userContext;
        $this->cartManagement = $cartManagement;
        $this->orderRepository = $orderRepository;
        parent::__construct($context);
    }

    /**
     * @param Quote $quote
     * @throws GraphQlAuthorizationException
     * @throws GraphQlInputException|CouldNotSaveException
     * @throws GraphQlNoSuchEntityException
     */
    protected function placeOrder($quote) {
        $this->checkCartCheckoutAllowance->execute($quote);

        if ($this->userContext->getUserId() === 0) {
            if (!$quote->getCustomerEmail()) {
                throw new GraphQlInputException(__("Guest email for cart is missing."));
            }
            $quote->setCheckoutMethod(CartManagementInterface::METHOD_GUEST);
        }

        try {
            $orderId = $this->cartManagement->placeOrder($quote->getId());
            $order = $this->orderRepository->get($orderId);

            return [
                'order' => [
                    'order_id' => $order->getIncrementId(),
                ],
            ];
        } catch (NoSuchEntityException $e) {
            throw new GraphQlNoSuchEntityException(__($e->getMessage()), $e);
        } catch (LocalizedException $e) {
            throw new GraphQlInputException(__('Unable to place order: %message', ['message' => $e->getMessage()]), $e);
        }
    }

    /**
     * @inheritDoc
     * @return null
     * @throws GraphQlAuthorizationException
     * @throws GraphQlInputException
     * @throws GraphQlNoSuchEntityException|CouldNotSaveException
     */
    public function execute()
    {
        $adyenStorage = $_SESSION['adyen_storage'];
        $bankResponse = $this->getRequest()->getParams();

        $paymentDetails = $this->APIHelper->callApi(
            '/payments/details',
            $this->APIHelper::METHOD_POST,
            [
                'paymentData' => $adyenStorage['paymentData'],
                'details' => [
                    'payload' => $bankResponse['payload']
                ]
            ]
        );

        // Set payment method on cart and add additional data
        $quote = $this->quoteFactory->create()->loadActive($adyenStorage['quoteId']);
        $this->setPaymentMethodOnCart->execute(
            $quote,
            [
                'code' => AdyenCcConfigProvider::CODE,
                'additional_data' => $paymentDetails
            ]
        );

        return $this->placeOrder($quote);
        // v TODO 0: retrieve saved during prev. step data from /payments
        // v TODO 1: request payment details from /payments/details
        // ? TODO 2: set payment method on cart
        // ? TODO 3: save order with corresponding details
        // ! TODO 4: redirect user to the success page

//        $redirect = $this->resultFactory->create(\Magento\Framework\Controller\ResultFactory::TYPE_REDIRECT);
//        $redirect->setUrl('/redirect/to/destination');
//        return $redirect;
    }
}
