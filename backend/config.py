import os
from dotenv import load_dotenv

class Config:
    """Application configuration"""
    
    def __init__(self):
        # Load environment variables
        load_dotenv(verbose=True)
        
        # Verify API key
        self.api_key = os.getenv('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("OpenAI API key not found in environment variables")
            
        # Set up paths
        self.receipts_dir = os.path.join(os.path.expanduser('~'), 'Documents', 'Receipts')
        self.upload_folder = os.path.join(self.receipts_dir, 'uploads')
        self.db_path = os.path.join(self.receipts_dir, 'receipts.db')
        
        # Create directories
        os.makedirs(self.upload_folder, exist_ok=True)

# Create global config instance
config = Config()
  