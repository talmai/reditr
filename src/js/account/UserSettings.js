import DataStore from '../utilities/DataStore';

class UserSettings {

    constructor(userObj) {

        this.storage = DataStore.createInstance(userObj.username);

    }

}

export default UserSettings;
