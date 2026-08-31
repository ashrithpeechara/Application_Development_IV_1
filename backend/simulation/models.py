import uuid
from django.db import models

class NetworkDevice(models.Model):
    DEVICE_TYPES = [
        ('router', 'Router'),
        ('switch', 'Switch'),
        ('server', 'Server'),
        ('host', 'Host'),
        ('cloud', 'Cloud Gateway'),
    ]

    STATUS_CHOICES = [
        ('ONLINE', 'Online'),
        ('STANDBY', 'Standby'),
        ('PROTECTED', 'Protected'),
        ('CRITICAL', 'Critical'),
        ('BYPASSED', 'Bypassed'),
        ('DEGRADED', 'Degraded'),
    ]

    node_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=150)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES, default='router')
    ip_address = models.GenericIPAddressField(default='10.0.0.1')
    mac_address = models.CharField(max_length=30, blank=True, null=True)
    port_capacity = models.CharField(max_length=50, default='10.0 Gbps')
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='ONLINE')
    load = models.IntegerField(default=15)
    x_pos = models.IntegerField(default=400)
    y_pos = models.IntegerField(default=250)
    is_custom = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.node_id}) - {self.status}"


class NetworkConnection(models.Model):
    LINK_TYPES = [
        ('normal', 'Normal'),
        ('anomalous', 'Anomalous'),
        ('bypass', 'Bypass Route'),
        ('inactive', 'Inactive'),
        ('standby', 'Standby'),
    ]

    link_id = models.CharField(max_length=100, unique=True, primary_key=True)
    source = models.ForeignKey(NetworkDevice, related_name='outgoing_links', on_delete=models.CASCADE)
    target = models.ForeignKey(NetworkDevice, related_name='incoming_links', on_delete=models.CASCADE)
    link_type = models.CharField(max_length=30, choices=LINK_TYPES, default='normal')
    traffic_level = models.CharField(max_length=20, default='low')
    bandwidth_gbps = models.FloatField(default=10.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source.node_id} -> {self.target.node_id} [{self.link_type}]"


class AutonomicAgent(models.Model):
    agent_id = models.CharField(max_length=50, unique=True, primary_key=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=150)
    status = models.CharField(max_length=50, default='MONITORING')
    task = models.TextField(blank=True)
    confidence = models.IntegerField(default=95)
    risk_level = models.CharField(max_length=30, default='LOW')
    color = models.CharField(max_length=30, default='#0284c7')
    last_event = models.CharField(max_length=255, blank=True)
    capabilities = models.JSONField(default=list, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.status} ({self.confidence}%)"


class BRSKIVoucher(models.Model):
    voucher_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    serial_number = models.CharField(max_length=100)
    device = models.ForeignKey(NetworkDevice, on_delete=models.SET_NULL, null=True, blank=True)
    nonce = models.CharField(max_length=50)
    pinned_domain_cert = models.CharField(max_length=255, default='SHA256:7B:3A:9F:88:C1:4E:02:D5:A6')
    domain_registrar = models.CharField(max_length=150, default='casa-autonomic-registrar.domain.net')
    masa_signature = models.TextField(blank=True)
    ldevid_cert = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=50, default='VALIDATED_AND_ENROLLED')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"BRSKI Voucher [{self.serial_number}] - {self.status}"


class AuditLogEvent(models.Model):
    LEVEL_CHOICES = [
        ('INFO', 'Info'),
        ('WARNING', 'Warning'),
        ('DANGER', 'Danger'),
        ('SUCCESS', 'Success'),
    ]

    event_id = models.CharField(max_length=100, unique=True, primary_key=True)
    timestamp = models.CharField(max_length=50)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='INFO')
    source = models.CharField(max_length=100)
    phase = models.CharField(max_length=50, default='NORMAL')
    title = models.CharField(max_length=200)
    message = models.TextField()
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.level}] {self.source}: {self.title}"
