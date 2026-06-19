from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
import hashlib

class SentinelCrypto:
    def __init__(self):
        # Generate a temporary session keypair for the demo
        self.private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        self.public_key = self.private_key.public_key()

    def sign_document_manifest(self, manifest_data: str):
        """
        Signs the document manifest to prevent tampering.
        """
        signature = self.private_key.sign(
            manifest_data.encode(),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return signature.hex()

    @staticmethod
    def get_file_integrity_hash(file_content: bytes):
        """
        Returns a SHA-512 hash for total file integrity.
        """
        return hashlib.sha512(file_content).hexdigest()

crypto_engine = SentinelCrypto()
