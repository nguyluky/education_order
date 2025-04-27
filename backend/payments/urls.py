from django.urls import path
from payments.api.views import (
    TransactionListView, TransactionDetailView, PaymentCreateView,
    PayoutAccountView, PayoutAccountCreateView
)

app_name = 'payments'

urlpatterns = [
    # Transaction endpoints
    path('transactions/', TransactionListView.as_view(), name='transaction_list'),
    path('transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
    path('pay/', PaymentCreateView.as_view(), name='payment_create'),
    
    # Payout account endpoints
    path('payout-account/', PayoutAccountView.as_view(), name='payout_account'),
    path('payout-account/create/', PayoutAccountCreateView.as_view(), name='payout_account_create'),
]