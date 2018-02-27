/***************************************************************************************************************
 ***************************************************************************************************************
 * BUDGET CONTROLLER *******************************************************************************************
 ***************************************************************************************************************
 ***************************************************************************************************************/
var budgetController = (function () {
    // PRIVATE
    var Expense,
        Income,
        data,
        calculateTotal;

    Expense = function(id, description, value) {
        this.id          = id;
        this.description = description;
        this.value       = value;
        this.percentage  = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    Income = function(id, description, value) {
        this.id          = id;
        this.description = description;
        this.value       = value;
    };

    calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(current) {
            sum = sum + current.value;
        });
        data.totals[type] = sum;
    };

    data = {
        allItems: {
            exp: [],
            inc: []        
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
        
    // PUBLIC
    return {
        addItem: function(type, des, val) {
            var newItem,
                ID;

            // Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;            
            } else {
                ID = 0;
            }

            // Create new Item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val)
            }

            // Push it into data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        deleteItem: function(type, id) {
            var ids,
                index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            console.log(data.allItems);
        },
        calculateBudget: function() {
            // calculate total income + expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate the percentage of income we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentage: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercentage();
            });
            return allPerc;
        },
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function() {
            console.log(data);
        }
    };
})();
/***************************************************************************************************************
 ***************************************************************************************************************
 * UI CONTROLLER ***********************************************************************************************
 ***************************************************************************************************************
 ***************************************************************************************************************/
var uiController = (function () {
    // PRIVATE
    var domStrings = {
        inputType:         '.add__type',
        inputDescription:  '.add__description',
        inputValue:        '.add__value',
        inputButton:       '.add__btn',
        incomeContainer:   '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel:       '.budget__value',
        incomeLabel:       '.budget__income--value',
        expensesLabel:     '.budget__expenses--value',
        percentageLabel:   '.budget__expenses--percentage',
        container:         '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel:         '.budget__title--month'
    };
    var formatNumber = function(num, type) {
        var numSplit,
            int,
            dec;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length-3, 3); 
        }
        dec = numSplit[1];
        
        if (type === 'exp') {
            return '-' + ' ' + int + '.' + dec;
        } else {
            return '+' + ' ' + int + '.' + dec;
        }
    };
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i],i);
        }
    };
    // PUBLIC
    return {
        getInput: function() {
            return {
                type:        document.querySelector(domStrings.inputType).value, // will be either inc or exp
                description: document.querySelector(domStrings.inputDescription).value,
                value:       parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },
        addListItem: function(obj, type) {
            var html,
                newHtml,
                element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'exp') {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace placeholder text with actual data
            newHtml = html.replace   ('%id%'         , obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%'      , formatNumber(obj.value, type));
            // Insert HTML to DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: function(selectorId) {
            var element;
            element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        clearFields: function() {
            var fields,
                fieldsArr;

            fields    = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            // Convert List to Array
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array) {
                current.value = '';
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(domStrings.budgetLabel).textContent     = formatNumber(obj.budget, type) + '€';
            document.querySelector(domStrings.incomeLabel).textContent     = formatNumber(obj.totalInc, 'inc') + '€';
            document.querySelector(domStrings.expensesLabel).textContent   = formatNumber(obj.totalExp, 'exp') + '€';

            if(obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '-';
            }
        },
        displayPercentages: function(percentage) {
            var fields;
            fields = document.querySelectorAll(domStrings.expensesPercLabel);



            nodeListForEach(fields,function(current, index) {
                if(percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '-';
                } 
            });
        },
        displayMonth: function() {
            var now,
                monthNames,
                month,
                year;
            now = new Date();
            monthNames = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(domStrings.dateLabel).textContent = monthNames[month] + ' ' + year;
        },
        changedType: function() {
            var fields;

            fields = document.querySelectorAll(
                domStrings.inputType + ', ' +
                domStrings.inputDescription + ', ' + 
                domStrings.inputValue
            );
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });
            document.querySelector(domStrings.inputButton).classList.toggle('red');
        },
        getDomStrings: function() {
            return domStrings;
        }
    };
})();
/***************************************************************************************************************
 ***************************************************************************************************************
 * APP CONTROLLER **********************************************************************************************
 ***************************************************************************************************************
 ***************************************************************************************************************/
var appController = (function (budgetCtrl, uiCtrl) {
    // PRIVATE
    var setupEventListeners = function() {
        var dom = uiCtrl.getDomStrings();

        document.addEventListener('keypress', function(event) {
            // If User Pressed "Enter" Key
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
    
        document.querySelector(dom.inputButton).addEventListener('click', ctrlAddItem);    

        document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
    };
    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        uiCtrl.displayBudget(budget);
    };
    var updatePercentages = function() {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentage();
        // 2. Read percentages from budget Controller
        var percentage = budgetCtrl.getPercentages();
        // 3. Update UI with new percentages
        uiCtrl.displayPercentages(percentage);
    };
    var ctrlAddItem = function() {
        var input,
            newItem;

        // 1. Get field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
            // 2. Add the item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add item to ui
            uiCtrl.addListItem(newItem, input.type);
            // 4. Clear fields
            uiCtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 6. Calculate and update percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function(event) {
        var itemId,
            splitId;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemId);
        if(itemId) {
            // 0. Split ID to retrieve value
            splitId = itemId.split('-');
            type    = splitId[0];
            id      = parseInt(splitId[1]);
            // 1. Delete Item from Data Structure
            budgetCtrl.deleteItem(type, id);
            // 2. Delete item from UI
            uiCtrl.deleteListItem(itemId);
            // 3. Update and show new budget
            updateBudget();
            // 4. Calculate and update percentages
            updatePercentages();
        }

    };   
    // PUBLIC
    return {
        init: function() {
            console.log('Application has started!');
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget:     0,
                totalInc:   0,
                totalExp:   0,
                percentage: 0
            });
            setupEventListeners();
        }
    }
})(budgetController, uiController);

appController.init();