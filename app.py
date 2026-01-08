"""
Fingge - Advanced Python Backend Server
This server provides:
1. Python code execution API
2. Question matching algorithm
3. Database management for Q&A
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import sys
import re
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# In-memory database for Q&A (in production, use a real database)
qa_database = [
    {
        "id": 1,
        "question": "How to fix 'list index out of range' error in Python?",
        "answer": "This error occurs when you try to access an index that doesn't exist in the list. Always check the length of the list before accessing elements: if index < len(my_list): value = my_list[index]",
        "keywords": ["list", "index", "range", "error", "python", "fix"],
        "date": "2023-10-15"
    },
    {
        "id": 2,
        "question": "What's the difference between lists and tuples?",
        "answer": "Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Lists use square brackets [], tuples use parentheses (). Use tuples for fixed data and lists for data that needs to be modified.",
        "keywords": ["list", "tuple", "difference", "python", "mutable", "immutable"],
        "date": "2023-10-10"
    }
]

# Stop words for keyword extraction
STOP_WORDS = {"how", "what", "why", "when", "where", "which", "the", "a", "an", 
              "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", 
              "am", "do", "does", "can", "and", "or", "but", "not", "this", "that"}

def extract_keywords(text):
    """Extract keywords from text by removing stop words and common words."""
    # Convert to lowercase and remove punctuation
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    
    # Split into words and filter
    words = text.split()
    keywords = []
    
    for word in words:
        # Keep words that are not stop words and have length > 2
        if word not in STOP_WORDS and len(word) > 2 and not word.isdigit():
            keywords.append(word)
    
    # Remove duplicates and return top 8 keywords
    return list(set(keywords))[:8]

def find_matching_questions(question, keywords, threshold=2):
    """Find questions in the database that match the given keywords."""
    matches = []
    
    for qa in qa_database:
        match_count = 0
        matched_keywords = []
        
        # Count matching keywords
        for keyword in keywords:
            if keyword in qa["keywords"]:
                match_count += 1
                matched_keywords.append(keyword)
        
        # If enough keywords match, add to results
        if match_count >= threshold:
            # Calculate a relevance score
            relevance_score = match_count / len(keywords) * 100
            
            matches.append({
                **qa,
                "match_count": match_count,
                "matched_keywords": matched_keywords,
                "relevance_score": round(relevance_score, 2)
            })
    
    # Sort by relevance score (highest first)
    matches.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return matches

def execute_python_code(code, timeout=10):
    """Execute Python code safely and return the output."""
    try:
        # Create a temporary file with the code
        with open("temp_code.py", "w") as f:
            f.write(code)
        
        # Execute the code with a timeout
        result = subprocess.run(
            [sys.executable, "temp_code.py"],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        # Clean up
        if os.path.exists("temp_code.py"):
            os.remove("temp_code.py")
        
        # Return the output
        if result.returncode == 0:
            return {
                "success": True,
                "output": result.stdout,
                "error": None
            }
        else:
            return {
                "success": False,
                "output": result.stdout,
                "error": result.stderr
            }
            
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "output": "",
            "error": "Code execution timed out. Possible infinite loop."
        }
    except Exception as e:
        return {
            "success": False,
            "output": "",
            "error": f"Execution error: {str(e)}"
        }

@app.route('/api/execute', methods=['POST'])
def execute_code():
    """