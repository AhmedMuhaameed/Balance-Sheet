// IIFE -> immediately  invoked function expression
//this is a Module pattern
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
        data.allItems[type].forEach(function (cur, index, array) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create Item Based on Inc or Exp type
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            //push it into our data structure
            data.allItems[type].push(newItem);

            //return the new element
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income the we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc;
            allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },
        testing: function () {
            console.log(data);
        },
    };
})();

var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month",
    };
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        if (int.length > 3) {
            int =int.substr(0, int.length - 3) +"," +int.substr(int.length - 3, int.length);
        }
        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };
    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            };
        },

        addListItem: function (obj, type) {
            var HTML, newHTML, element;
            //create HTML string with placeholder text
            if (type === "inc") {
                element = DOMstrings.incomeContainer;
                HTML =
                    '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "exp") {
                element = DOMstrings.expensesContainer;
                HTML =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //replace the placeholder text with some actual data
            newHTML = HTML.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));

            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            // like overriding a Slice method it's just used for arrays and querySelectorAll return List
            fieldsArr = Array.prototype.slice.call(fields);
            //clear all fields
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
                current.description = "";
            });

            //focus on description again
            fields[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? (type = "inc") : (type = "exp");
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent ="---";
            }
        },
        displayPercentages: function (percentages) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
            });
        },
        displayMonth: function () {
            var now, year, month, months;
            months = [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
            ];
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =months[month] + " " + year;
        },
        changedType: function () {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputType +"," +DOMstrings.inputDescription +"," +DOMstrings.inputValue
            );

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus");
            });
        },
        getDOMstrings: function () {
            return DOMstrings;
        },
    };
})();

var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updateBudget = function () {
        //1.caluclate Budget
        budgetCtrl.calculateBudget();

        //2.return Budget
        var budget = budgetCtrl.getBudget();

        //3.Display the Budget UI
        UICtrl.displayBudget(budget);
    };
    var updatePercentages = function () {
        var percentages;
        //1.calculate percentages
        budgetCtrl.calculatePercentages();

        //2.read Percentages from budget Controller
        percentages = budgetCtrl.getPercentages();

        //3.update UI with new Percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem = function () {
        var input, newItem;
        //1.get Field input data
        input = UICtrl.getInput();

        //data validation
        if (input.description !== "" &&!isNaN(input.value) &&input.value > 0) {
            //2. add item to the budget cotroller
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );

            //3.add item to UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear Fields
            UICtrl.clearFields();

            //5.calculate and update budget
            updateBudget();

            //6.calculate and update Percentages
            updatePercentages();
        }
    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            //example : inc-1
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1.delete Item from datastructure
            budgetCtrl.deleteItem(type, ID);

            //2.delete Item from UI
            UICtrl.deleteListItem(itemID);

            //3.update and show new Budget
            updateBudget();

            //4.calculate and Update Percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log("hi");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
