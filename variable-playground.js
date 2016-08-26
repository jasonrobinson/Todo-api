// assign person
var person = {
    name: 'Andrew',
    age: 21
}

// pass by reference
function updatePerson (obj) {
    // obj = {
    //     name: 'Andrew',
    //     age: 24
    // }
    obj.age = 24;
}

updatePerson(person);
console.log(person);

// Array example

var grades = [15, 37];

function updateGrades (grades) {
    grades = [15, 37, 44];
}

function updateGradesMutate (grades) {
    grades.push(44);
    debugger;
}

// can also use return and assign...

updateGrades(grades);
console.log(grades);

updateGradesMutate(grades);
console.log(grades);
