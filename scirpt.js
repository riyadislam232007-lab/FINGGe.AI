// Fingge - Interactive Python Coding & Q&A System

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
});

function initApp() {
    // DOM Elements
    const codeEditor = document.getElementById('code-editor');
    const outputElement = document.getElementById('output');
    const runButton = document.getElementById('run-btn');
    const clearButton = document.getElementById('clear-btn');
    const questionInput = document.getElementById('question-input');
    const askButton = document.getElementById('ask-btn');
    const qaList = document.getElementById('qa-list');
    const recentQa = document.getElementById('recent-qa');
    const searchInput = document.getElementById('search-qa');
    
    // Sample Q&A database
    let qaDatabase = [
        {
            id: 1,
            question: "How to fix 'list index out of range' error in Python?",
            answer: "This error occurs when you try to access an index that doesn't exist in the list. Always check the length of the list before accessing elements: if index < len(my_list): value = my_list[index]",
            keywords: ["list", "index", "range", "error", "python", "fix"],
            date: "2023-10-15"
        },
        {
            id: 2,
            question: "What's the difference between lists and tuples?",
            answer: "Lists are mutable (can be changed) while tuples are immutable (cannot be changed). Lists use square brackets [], tuples use parentheses (). Use tuples for fixed data and lists for data that needs to be modified.",
            keywords: ["list", "tuple", "difference", "python", "mutable", "immutable"],
            date: "2023-10-10"
        },
        {
            id: 3,
            question: "How to read a file in Python?",
            answer: "Use the open() function: with open('filename.txt', 'r') as file: content = file.read(). This ensures the file is properly closed after reading.",
            keywords: ["file", "read", "python", "open", "function"],
            date: "2023-10-05"
        },
        {
            id: 4,
            question: "How to install Python packages using pip?",
            answer: "Use the command: pip install package_name. For specific versions: pip install package_name==version. Upgrade pip: python -m pip install --upgrade pip.",
            keywords: ["pip", "install", "package", "python", "command"],
            date: "2023-10-01"
        },
        {
            id: 5,
            question: "What is a lambda function in Python?",
            answer: "A lambda function is a small anonymous function defined with the lambda keyword: lambda arguments: expression. Example: add = lambda x, y: x + y.",
            keywords: ["lambda", "function", "anonymous", "python"],
            date: "2023-09-28"
        }
    ];
    
    // Recent Q&A history
    let recentHistory = [];
    
    // Initialize the Q&A list
    renderQAList();
    renderRecentQA();
    
    // Run Python code (simulated)
    runButton.addEventListener('click', function() {
        const code = codeEditor.value;
        outputElement.textContent = "Running your code...\n\n";
        
        // Simulate code execution with a delay
        setTimeout(() => {
            try {
                // In a real implementation, this would connect to a Python backend
                // For demo purposes, we'll simulate execution of common Python code
                const simulatedOutput = simulatePythonExecution(code);
                outputElement.textContent = simulatedOutput;
                
                // Add to recent history
                addToRecentHistory({
                    type: "code",
                    content: `Code executed: ${code.substring(0, 50)}...`,
                    result: simulatedOutput.substring(0, 100) + "...",
                    time: new Date().toLocaleTimeString()
                });
                
                // Highlight successful execution
                outputElement.style.color = "#4cd964";
            } catch (error) {
                outputElement.textContent = `Error: ${error.message}`;
                outputElement.style.color = "#ff6b6b";
            }
        }, 1000);
    });
    
    // Clear the editor
    clearButton.addEventListener('click', function() {
        codeEditor.value = "";
        outputElement.textContent = "Your code output will appear here...";
        outputElement.style.color = "#4cd964";
    });
    
    // Ask a question
    askButton.addEventListener('click', function() {
        const question = questionInput.value.trim();
        
        if (!question) {
            alert("Please enter a question!");
            return;
        }
        
        // Extract keywords from the question
        const keywords = extractKeywords(question);
        
        // Find matching questions in the database
        const matches = findMatchingQuestions(question, keywords);
        
        if (matches.length > 0) {
            // Show matching questions and answers
            displayMatches(matches);
            
            // Add to recent history
            addToRecentHistory({
                type: "question",
                content: question,
                result: `Found ${matches.length} matching question(s)`,
                time: new Date().toLocaleTimeString()
            });
        } else {
            // Add new question to database
            const newQuestion = {
                id: qaDatabase.length + 1,
                question: question,
                answer: "This question hasn't been answered yet. Please check back later!",
                keywords: keywords,
                date: new Date().toISOString().split('T')[0]
            };
            
            qaDatabase.push(newQuestion);
            
            // Update UI
            renderQAList();
            
            // Add to recent history
            addToRecentHistory({
                type: "question",
                content: question,
                result: "Added to question database (no matches found)",
                time: new Date().toLocaleTimeString()
            });
            
            // Show confirmation
            alert("Your question has been added to the database! We'll notify you when it's answered.");
        }
        
        // Clear the input
        questionInput.value = "";
    });
    
    // Search Q&A database
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        filterQAList(searchTerm);
    });
    
    // Function to extract keywords from a question
    function extractKeywords(question) {
        // Common programming words to exclude
        const stopWords = ["how", "what", "why", "when", "where", "which", "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "am", "do", "does", "can", "and", "or", "but"];
        
        // Extract words, convert to lowercase, remove punctuation
        const words = question.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));
        
        // Remove duplicates and return
        return [...new Set(words)].slice(0, 8); // Limit to 8 keywords
    }
    
    // Function to find matching questions
    function findMatchingQuestions(question, keywords) {
        const matches = [];
        
        // Check each question in the database
        qaDatabase.forEach(qa => {
            let matchCount = 0;
            const matchedKeywords = [];
            
            // Count matching keywords
            keywords.forEach(keyword => {
                if (qa.keywords.includes(keyword)) {
                    matchCount++;
                    matchedKeywords.push(keyword);
                }
            });
            
            // If at least 2 keywords match, add to matches
            if (matchCount >= 2) {
                matches.push({
                    ...qa,
                    matchCount,
                    matchedKeywords
                });
            }
        });
        
        // Sort by number of matches (descending)
        matches.sort((a, b) => b.matchCount - a.matchCount);
        
        return matches;
    }
    
    // Function to display matching questions
    function displayMatches(matches) {
        let matchHTML = "<h3>Matching Questions Found:</h3>";
        
        matches.forEach(match => {
            matchHTML += `
                <div class="qa-item">
                    <h4>${match.question}</h4>
                    <p><strong>Answer:</strong> ${match.answer}</p>
                    <div class="keywords">
                        <span class="keyword">Matches: ${match.matchCount}</span>
                        ${match.matchedKeywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                    </div>
                </div>
            `;
        });
        
        // Show matches in a modal-like display
        const matchContainer = document.createElement('div');
        matchContainer.className = 'card';
        matchContainer.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3><i class="fas fa-check-circle"></i> Matching Questions Found</h3>
                <button id="close-matches" class="btn-clear" style="padding: 5px 15px;">Close</button>
            </div>
            ${matchHTML}
        `;
        
        // Insert after the question input card
        const questionCard = document.querySelector('.question-input').parentNode;
        questionCard.parentNode.insertBefore(matchContainer, questionCard.nextSibling);
        
        // Add event listener to close button
        document.getElementById('close-matches').addEventListener('click', function() {
            matchContainer.remove();
        });
    }
    
    // Function to render the Q&A list
    function renderQAList(filter = "") {
        let filteredQA = qaDatabase;
        
        if (filter) {
            filteredQA = qaDatabase.filter(qa => 
                qa.question.toLowerCase().includes(filter) || 
                qa.answer.toLowerCase().includes(filter) ||
                qa.keywords.some(keyword => keyword.includes(filter))
            );
        }
        
        let qaHTML = "";
        
        if (filteredQA.length === 0) {
            qaHTML = "<p style='text-align: center; color: #a0c8ff;'>No questions found. Try a different search term.</p>";
        } else {
            filteredQA.forEach(qa => {
                qaHTML += `
                    <div class="qa-item">
                        <h4>${qa.question}</h4>
                        <p><strong>Answer:</strong> ${qa.answer}</p>
                        <div class="keywords">
                            ${qa.keywords.map(keyword => `<span class="keyword">${keyword}</span>`).join('')}
                        </div>
                        <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">Added: ${qa.date}</p>
                    </div>
                `;
            });
        }
        
        qaList.innerHTML = qaHTML;
    }
    
    // Function to filter Q&A list
    function filterQAList(filter) {
        renderQAList(filter.toLowerCase());
    }
    
    // Function to render recent Q&A
    function renderRecentQA() {
        let recentHTML = "";
        
        if (recentHistory.length === 0) {
            recentHTML = "<p style='text-align: center; color: #a0c8ff;'>No recent activity. Run some code or ask a question!</p>";
        } else {
            recentHistory.forEach(item => {
                const icon = item.type === "code" ? "fa-code" : "fa-question-circle";
                const colorClass = item.type === "code" ? "answer" : "question";
                
                recentHTML += `
                    <div class="recent-item ${colorClass}">
                        <h4><i class="fas ${icon}"></i> ${item.type === "code" ? "Code Execution" : "Question Asked"}</h4>
                        <p><strong>${item.type === "code" ? "Code" : "Question"}:</strong> ${item.content}</p>
                        <p><strong>Result:</strong> ${item.result}</p>
                        <p style="font-size: 0.8rem; color: #888;">Time: ${item.time}</p>
                    </div>
                `;
            });
        }
        
        recentQa.innerHTML = recentHTML;
    }
    
    // Function to add to recent history
    function addToRecentHistory(item) {
        recentHistory.unshift(item); // Add to beginning
        
        // Keep only the last 6 items
        if (recentHistory.length > 6) {
            recentHistory = recentHistory.slice(0, 6);
        }
        
        renderRecentQA();
    }
    
    // Function to simulate Python code execution (for demo)
    function simulatePythonExecution(code) {
        // Check for common code patterns and simulate output
        let output = "";
        
        if (code.includes("print(")) {
            output += ">>> Code Output:\n";
            
            // Simulate simple print statements
            const printMatches = code.match(/print\(["']([^"']+)["']\)/g);
            if (printMatches) {
                printMatches.forEach(match => {
                    const text = match.match(/\(["']([^"']+)["']\)/);
                    if (text) output += text[1] + "\n";
                });
            }
            
            // Simulate calculations
            if (code.includes("add(") && code.includes("def add")) {
                output += "Addition: 5 + 3 = 8\n";
            }
            
            if (code.includes("subtract(") && code.includes("def subtract")) {
                output += "Subtraction: 10 - 4 = 6\n";
            }
            
            // Check for loops
            if (code.includes("for") && code.includes("range")) {
                output += "\n>>> Loop Simulation:\n";
                output += "0\n1\n2\n3\n4\n";
            }
            
            // Check for list operations
            if (code.includes("list") || code.includes("append")) {
                output += "\n>>> List Operations:\n";
                output += "List created successfully\n";
                output += "Element appended to list\n";
            }
        } else {
            output += ">>> No output generated. Try adding print() statements to see results.\n";
        }
        
        output += "\n>>> Code executed successfully!\n";
        output += "Note: This is a simulation. In a real implementation, your code would be executed on a Python server.";
        
        return output;
    }
    
    // Add some initial recent history
    addToRecentHistory({
        type: "question",
        content: "What is a lambda function?",
        result: "Found 1 matching question",
        time: "10:30 AM"
    });
    
    addToRecentHistory({
        type: "code",
        content: "print('Hello, World!')",
        result: "Hello, World!",
        time: "09:45 AM"
    });
}