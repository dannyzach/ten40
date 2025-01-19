import os
from openai import OpenAI
from typing import Dict, Optional
from config import config

class CategorizationError(Exception):
    """Custom exception for categorization service errors"""
    pass

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class CategorizationService:
    @staticmethod
    def categorize_receipt(content: Dict) -> str:
        """Categorize receipt based on its content using LLM"""
        try:
            prompt = f"""
            Analyze this receipt and categorize it into one of these IRS Schedule C expense categories:
            {', '.join(config.expense_categories)}

            Receipt details:
            Vendor: {content.get('Vendor', '')}
            Items/Description: {content.get('text', [])}

            Return only the category name, nothing else.
            """

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50
            )

            category = response.choices[0].message.content.strip()
            return category if category in config.expense_categories else "Other Expenses"
            
        except Exception as e:
            print(f"Categorization error: {str(e)}")
            return "Other Expenses" 