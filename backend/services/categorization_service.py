import os
from openai import OpenAI
from typing import Dict, Optional

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

class CategorizationService:
    CATEGORIES = [
        "Advertising",
        "Car and truck expenses",
        "Contract labor",
        "Depreciation",
        "Insurance",
        "Office expense",
        "Supplies",
        "Travel",
        "Meals",
        "Utilities",
        "Other expenses"
    ]

    @staticmethod
    def categorize_receipt(content: Dict) -> str:
        """Categorize receipt based on its content using LLM"""
        try:
            prompt = f"""
            Analyze this receipt and categorize it into one of these IRS Schedule C expense categories:
            {', '.join(CategorizationService.CATEGORIES)}

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
            return category if category in CategorizationService.CATEGORIES else "Other expenses"
            
        except Exception as e:
            print(f"Categorization error: {str(e)}")
            return "Other expenses" 