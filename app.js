// BUDGET CONTROLLER
var BudgetController = (function(){
    
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
      
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;  
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotals = function(type) {
        var sum = 0;
        for(var i=0; i<data.allItems[type].length; i++) {
            sum += data.allItems[type][i].value;
        }
        data.totals[type] = sum;        
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: 0
    };
    
    
    return {
       addItem: function(type, des, val) {
           var newItem, ID;
           
           // [1 2 3 4 5], next ID=6
           // [1 2 3 6 8], next ID=9
           // ID = ID of last item + 1
           
           
           // Create a new ID
           if (data.allItems[type].length === 0){
               ID = 0;
           } else {
               ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           }
           
           // Create a new item
           if (type === 'exp') {
               newItem = new Expense(ID, des, val);
           } else if (type === 'inc') {
               newItem = new Income(ID, des, val);
           }
           
           // Add the item to our data structure
           data.allItems[type].push(newItem);
           
           // Return the item
           return newItem;
       },
        
       deleteItem: function(type, id) {
          var index = -1;
           
          for(var i=0; i<data.allItems[type].length; i++) {
              if(data.allItems[type][i].id === id) {
                  index = i;
              }
          }   
         
          if(index !== '-1') {
              data.allItems[type].splice(index, 1);
          }   
           
       },
        
       calculateBudget: function() {
        
           // 1. calculate total income and expenses
           calculateTotals('exp');
           calculateTotals('inc');
           
           // 2. calculate the budget: income - expenses
           data.budget = data.totals.inc - data.totals.exp;
           
           // 3. calculate the percentage of income that we spend
           if(data.totals.inc > 0) {
              data.percentage =  Math.round((data.totals.exp / data.totals.inc) * 100); 
           } else {
              data.percentage = -1;   
           }
           
           // Example: inc = 200, exp = 100: 100/200 = 0.5 * 100 = 50%.
           
       },
        
       getBudget: function() {
           return {
             budget: data.budget,
             totalInc: data.totals.inc,
             totalExp: data.totals.exp,
             percentage: data.percentage
           };
       },
        
       calculatePercentages: function() {
         
           // my comment: loop on all expenses and calc the percentage of each expense
           data.allItems.exp.forEach(function(currentExpense) {
               currentExpense.calcPercentage(data.totals.inc);
           });
           
       },
        
       getPercentages: function () {
         
           // my comment: store all the percentages in array and return it 
           // my comment: the difference between forEach() and map() is: map always return somthing but forEach doesn't return anything
           // my comment: here map function will loop on all expenses and call getPercentage() for each one , and store them in percentageArr
           var percentagesArr = data.allItems.exp.map(function(currentExpense) {
              return currentExpense.getPercentage();    
           });
           
           return percentagesArr;
       },    
       
       testing: function() {
           return data;
       }    
        
        
    };
    
})();




// UI CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {
      inputType: '.add__type',
      inputDescription: '.add__description',
      inputValue: '.add__value',
      inputAddBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      persentageLabel: '.budget__expenses--percentage',
      container: '.container',
      percentageExpenceLabel: '.item__percentage',
      dataLabel: '.budget__title--month'
    };
    
    
    var formatNumber = function(num, type) {
        var splitNum, int, dec, sign;
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        splitNum = num.split('.');
        
        int = splitNum[0];
        dec = splitNum[1];
        
        // 2310 -> 2,310 | 23410 -> 23,410 | 236,410 
        
        // add the separation comma
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length);
        }
        
        // add the sign
        type === 'exp' ? sign = '-' : sign = '+'
        
        return sign + ' ' + int + '.' + dec;
    
    };
    
    var nodeListForEach = function(list, callback) {
               for(var i=0; i<list.length; i++) {
                   callback(list[i], i);
               }
    };
    
    
    return {
        getInput: function() {
            return {
              type: document.querySelector(DOMstrings.inputType).value,
              description: document.querySelector(DOMstrings.inputDescription).value,
              value: parseFloat(document.querySelector(DOMstrings.inputValue).value)    
            }
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, container;
            
            // 1. Create an HTML string with a placeholder text
            
            if (type === 'inc') {
                container = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if (type === 'exp') {
                container = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            }
            
            // 2. Replace the placeholder with some actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // 3. insert the HTML element to the DOM
            
            document.querySelector(container).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
          
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFeilds: function() {
          
            document.querySelector(DOMstrings.inputDescription).value = "";
            document.querySelector(DOMstrings.inputValue).value = "";
            
            document.querySelector(DOMstrings.inputDescription).focus();
            
        },
        
        displayBudget: function(obj) {
           var type;    
            
           if(obj.budget > 0) {
               type = 'inc'
           } else {
               type = 'exp'
           }      
            
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
           document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
           document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
           
            
           if(obj.percentage > 0) {
             document.querySelector(DOMstrings.persentageLabel).textContent = obj.percentage + '%';    
           } else {
             document.querySelector(DOMstrings.persentageLabel).textContent = '---';   
           }    
            
        },
        
        displayPercentages: function(percentages) {
          
            var percentagesList = document.querySelectorAll(DOMstrings.percentageExpenceLabel);
            
            nodeListForEach(percentagesList, function(current, index) {
               if(percentages[index] > 0) {
                  current.textContent = percentages[index] + '%';    
               } else {
                  current.textContent = '---';   
               }
                
            });
            
            /* Another way
            
            var percentagesArr = Array.prototype.slice.call(percentagesList);
            
            percentagesArr.forEach(function(current, index) {
               if(percentages[index] > 0) {
                  current.textContent = percentages[index] + '%';    
               } else {
                  current.textContent = '---';   
               } 
            });
            
            */
            
        },
        
        displayDate: function() {
          var now, month, year, months;
         
          now = new Date();
          month = now.getMonth();    
          year = now.getFullYear();
          months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];    
            
          document.querySelector(DOMstrings.dataLabel).textContent = months[month] + ' ' + year + ' :';    
              
        },
        
        changedType: function() {
          
            var feilds = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue);
            
            nodeListForEach(feilds, function(current) {
               current.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputAddBtn).classList.toggle('red');
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
        
    };
    
})();




// GLOPAL APP CONTROLLER
var controller = (function(BudgetCtrl, UICtrl){
    
    
   var setupEventListeners = function() {
       var DOM = UICtrl.getDOMstrings();   
       
       document.querySelector(DOM.inputAddBtn).addEventListener('click', addItem);
       
       document.addEventListener('keypress', function(e) {
           if(e.keyCode === 13 || e.which === 13) {
               addItem();
           }
       });
       
       document.querySelector(DOM.container).addEventListener('click', deleteItem);
       
       document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
       
   };
       

   var updateBudget = function() {
       
       // 1. calculate the budget
       BudgetCtrl.calculateBudget();
       
       // 2. return the budget
       var budget = BudgetCtrl.getBudget();
       
       // 3. display the budget on the UI
       UICtrl.displayBudget(budget); 
       
   };    
    
   var updatePercentages = function() {
     
       // 1. calculate the percentages
       BudgetCtrl.calculatePercentages();
       
       // 2. return the percentages
       var allPercentages = BudgetCtrl.getPercentages();
       
       // 3. update the UI with the new percentages
       UICtrl.displayPercentages(allPercentages);       
   };    
    
   var addItem = function() {
       var input, newItem;
       
       // 1. get the input fields
       input = UICtrl.getInput();
       
       if(input.description !== "" && !isNaN(input.value) && input.value > 0 ) {
        
           // 2. add the item to the budget controller
           newItem = BudgetCtrl.addItem(input.type, input.description, input.value);

           // 3. display the item on the UI
           UICtrl.addListItem(newItem, input.type);

           // 4. clear feilds
           UICtrl.clearFeilds();

           // 5. calculate and update the budget
           updateBudget();
           
           // 6. calculate and update the percentages
           updatePercentages();
       }
       
              
   }; 
    
        
   var deleteItem = function(event) {
       var itemID, temp, type, ID;
       
       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       
       if(itemID) {
           
           temp = itemID.split('-');
           type = temp[0];
           ID = parseInt(temp[1]);
           
           // 1. delete the item from the data structrue
           BudgetCtrl.deleteItem(type, ID);
           
           // 2. delete the item from the UI
           UICtrl.deleteListItem(itemID);
           
           // 3. update and show the budget
           updateBudget();
           
           // 4. calculate and update the percentages
           updatePercentages();
       }
       
   };    
    
   return {
       init: function() {
         console.log('The application has started.');
         UICtrl.displayDate();   
         UICtrl.displayBudget({
             budget: 0,
             totalInc: 0,
             totalExp: 0,
             percentage: 0
           });
         setupEventListeners();
       }
   };
    
})(BudgetController, UIController);


controller.init();

