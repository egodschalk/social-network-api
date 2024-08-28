const User = require('../models/User');

module.exports = {
    async getUsers(req, res) {
        try {
            const users = await User.find().populate('thoughts').populate('friends');
            res.json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId }).populate('friends')
                .select('-__v');

            if (!user) {
                return res.status(404).json({ message: 'No user with that ID' });
            }

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // create a new user
    async createUser(req, res) {
        try {
            const dbUserData = await User.create(req.body);
            res.json(dbUserData);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    async updateUser(req, res) {
        try {
            const dbUserData = await User.findOneAndUpdate(
                { _id: req.params.userId },
                {
                    username: req.body.username,
                    email: req.body.email
                },
                { new: true }
            );
            res.json(dbUserData);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    async deleteUser(req, res) {
        try {
            // recommended method of findOneAndRemove was not working...
            const user = await User.deleteOne({ _id: req.params.userId });
            console.log("user: ", user)
            if (!user) {
                return res.status(404).json({ message: 'No such user exists' })
            }

            // Cannot get the thought to delete with the user that created the thought...
            await Thought.deleteMany({ userId: req.params.userId });

            res.json({ message: 'User and associated thoughts successfully deleted' });
        } catch (err) {
            console.log("Err: ", err);
            res.status(500).json(err);
        }
    },
    async addFriend(req, res) {
        try {

            const user = await User.findByIdAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.params.friendId } },
                { new: true }
            );

            console.log("Friend Added: ", user)

            res.json({ message: 'Friend added successfully', user });
        } catch (err) {
            res.status(500).json(err);
        }
    },
    async deleteFriend(req, res) {
        try {
            const user = await User.findByIdAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.friendId } },
                { new: true }
            );
            console.log("Friend removed: ", user)

            res.json({ message: 'Friend removed successfully', user });
        } catch (err) {
            res.status(500).json(err);
        }
    },
};
