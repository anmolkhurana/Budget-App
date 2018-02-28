//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;

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

        calculateBudget: function () {

            //1. Calculate total income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            //2. Calculate the budget (inc - exp)
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage
            if(data.totals.inc > 0) {
                data.percentage =Math.round((data.totals.exp / data.totals.inc) * 100);    
            } else {
                data.percentage = -1 ;
            }
             

        },
        
        getBudget: function(){
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
        expensesContainer: '.expenses__list'

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

                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';

            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="expense-%id%"> <div class="item__description"> %description% </div><div class="right clearfix"> <div class="item__value"> %value% </div> <div class="item__percentage"> 21% </div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"> </i> </button> </div></div> </div>';


            }


            //2. Replace the placeholder with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //3.Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);


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

        getDOMstrings: function () {
            return DOMstrings;
        }


    };


})();


//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {


    var setupEventListeners = function () {

        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', function () {

            cntlrAddItem();
        })


        document.addEventListener('keypress', function (event) {

            if (event.keyCode === 13 || event.which === 13) {
                cntlrAddItem();
            }
        });

    };


    var updateBudget = function () {

        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        //3.Dsiplay the Budget on the UI
        console.log(budget);
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

        }

    };

    return {
        init: function () {
            console.log('Application has started.')
            setupEventListeners();
        }
    };

})(budgetController, UIcontroller);

controller.init();
