//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;

    };

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {

            this.percentage = Math.round((this.value / totalIncome) * 100);

        } else {

            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {

        return this.percentage;

    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

    };

    var calculateTotal = function (type) {
        var sum = 0;

        data.allItems[type].forEach(function (curr) {
            sum = sum + curr.value;
        });

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

        percentage: -1
    };

    return {

        addItem: function (type, des, val) {

            var newItem, ID;

            if (data.allItems[type].length > 0) {

                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {

                ID = 0;
            }


            if (type === 'exp') {

                newItem = new Expense(ID, des, val);

            } else if (type === 'inc') {

                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;

        },

        deleteItem: function (type, id) {
            var ids;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);

            }

        },

        calculateBudget: function () {

            //1. Calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            //2. Calculate the budget (inc - exp)
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage
            if (data.totals.inc > 0) {

                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {

                data.percentage = -1;
            }


        },

        calculatePercentage: function () {

            data.allItems.exp.forEach(function (curr) {
                curr.calcPercentage(data.totals.inc);
            });

        },

        getPercentages: function () {

            var allPerc = data.allItems.exp.map(function (curr) {

                return curr.getPercentage();

            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };




})();


//UI CONTROLLER
var UIcontroller = (function () {

    var DOMstrings = {

        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'

    };
    
    
    var formatNumber = function(num, type){
            var numSplit, int, dec, type;
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
        
            //2,310 or 23,100
            if(int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            // ----> type === 'exp' ? sign = '-' : sign = '+'; 
            //return type + ' ' + int + dec OR
            return (type === 'exp' ? '-' : '+') +  ' ' + int + '.' + dec;
        };
    
    var nodeListForEach = function (list, callback) {
                
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };



    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;

            //1. Create HTML string with place holder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description"> %description% </div><div class="right clearfix"> <div class="item__value"> %value% </div> <div class="item__percentage"> 21% </div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"> </i> </button> </div></div> </div>';


            }


            //2. Replace the placeholder with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //3.Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


        },

        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ' , ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {

                current.value = "";

            });

            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'; 
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {

                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }



        },

        displayPercentages: function(percentages) {

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {

                if (percentages[index] > 0) {
                    
                    current.textContent = percentages[index] + '%';
                
                } else {
                    
                    current.textContent = '---';
                }

            });

        },
        
        displayMonth: function(){
            var now, year, month, months;
            months =['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date();
            
            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function(){
            
        var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
        
        nodeListForEach(fields, function(cur){
        
            cur.classList.toggle('red-focus'); 
        
    });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        
        
        },
                    
                    
        getDOMstrings: function () {
            return DOMstrings;
        }


    };


})();


//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {


    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', cntlrAddItem);

        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                cntlrAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', cntlrDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);

    };


    var updateBudget = function () {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3.Dsiplay the Budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function () {

        //1. Calculate the percentages
        budgetCtrl.calculatePercentage();

        //2. Return percentages
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI 
        UICtrl.displayPercentages(percentages);
    }

    var cntlrAddItem = function () {

        var input, newItem;

        //1. Get the field Input data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            //2. Add items to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add items to the UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear the fields after pushing to the UI
            UICtrl.clearFields();

            //5. Calculate the Budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();

        }

    };

    var cntlrDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update the budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }

    }

    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1

            });
            setupEventListeners();
            
        }
    };

})(budgetController, UIcontroller);

controller.init();
