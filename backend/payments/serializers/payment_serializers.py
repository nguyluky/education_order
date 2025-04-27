from rest_framework import serializers
from payments.models import Transaction, PayoutAccount
from users.serializers.user_serializers import StudentSerializer, EducatorSerializer
from sessions.serializers.session_serializers import SessionSerializer

class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model."""
    student = StudentSerializer(read_only=True)
    educator = EducatorSerializer(read_only=True)
    session = SessionSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'session', 'student', 'educator', 'amount', 
                 'transaction_type', 'status', 'transaction_id', 
                 'payment_method', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a payment for a session."""
    session_id = serializers.IntegerField(write_only=True)
    payment_method = serializers.CharField(write_only=True)
    
    class Meta:
        model = Transaction
        fields = ['session_id', 'payment_method']
    
    def create(self, validated_data):
        # Extract data from validated data
        session_id = validated_data.pop('session_id')
        payment_method = validated_data.pop('payment_method')
        
        # Get the current user (student)
        student = self.context['request'].user.student_profile
        
        # Get the session
        from sessions.models import Session
        session = Session.objects.get(id=session_id)
        
        # Validate that the student is the one who booked the session
        if session.student != student:
            raise serializers.ValidationError("You can only pay for your own sessions.")
        
        # Calculate payment amount based on session duration and educator rate
        amount = session.session_cost
        
        # Create the transaction
        transaction = Transaction.objects.create(
            session=session,
            student=student,
            educator=session.educator,
            amount=amount,
            transaction_type='payment',
            status='pending',
            payment_method=payment_method
        )
        
        return transaction

class PayoutAccountSerializer(serializers.ModelSerializer):
    """Serializer for PayoutAccount model."""
    educator = EducatorSerializer(read_only=True)
    
    class Meta:
        model = PayoutAccount
        fields = ['id', 'educator', 'account_name', 'account_number', 
                 'bank_name', 'bank_code', 'is_verified', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'is_verified']

class PayoutAccountCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating an educator's payout account."""
    class Meta:
        model = PayoutAccount
        fields = ['account_name', 'account_number', 'bank_name', 'bank_code']
    
    def create(self, validated_data):
        # Get the current user (educator)
        educator = self.context['request'].user.educator_profile
        
        # Create or update the payout account
        payout_account, created = PayoutAccount.objects.update_or_create(
            educator=educator,
            defaults=validated_data
        )
        
        return payout_account