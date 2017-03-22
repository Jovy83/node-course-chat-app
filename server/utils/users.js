// user object structure
// [{
//     id: 'asdfoawh',
//     name: 'gago drew',
//     room: 'roomA'
// }]

// ES6 classes
class Users {
    constructor() {
        // constructors are optional when creating classes. but they are helpful when instantiating objects
        this.users = []; // 'this' refers to the instance
    }

    // methods (no need for the func keyword)
    addUser(id, name, room) {
        var user = { id, name, room };
        this.users.push(user);
        return user;
    }

    removeUser(id) {
        // return deleted user 
        var userToDelete = this.getUser(id);
        if (userToDelete) {
            this.users = this.users.filter((user) => {
                return user.id !== id;
            });
        }
        return userToDelete;
    }

    getUser(id) {
        
        // faster way using find, no need to use [0] because this only returns one object if it ever finds a matching object 
        return this.users.find((user) => {
             return user.id === id
        });
       
        // return this.users.filter((user) => {
        //     return user.id === id
        // })[0]; // return the first element of the filtered array
    }

    getUserList(room) {
        // returns an array of names
        var filteredUsers = this.users.filter((user) => {
            return user.room === room; // if true, it stores the user in the filteredUsers array. can convert this to shorthand ES6 but won't do that for readable purposes.
        });
        var namesArray = filteredUsers.map((user) => {
            // map lets us return and get the just the value we want to use 
            return user.name;
        });

        return namesArray;
    }
}

module.exports = { Users };