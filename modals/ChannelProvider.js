var ObjectID = require('bson').ObjectID;
ChannelProvider = function(db) {
    this.db = db;
};

ChannelProvider.prototype.getCollection = function(callback) {
    this.db.collection('channels', function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            callback(null, channel_collection);
        }
    });
};

ChannelProvider.prototype.findAll = function(callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error)
        } else {
            channel_collection.find(function(error, cursor) {
                if (error) {
                    callback(error)
                } else {
                    cursor.toArray(function(error, results) {
                        if (error) {
                            callback(error)
                        } else {
                            callback(null, results)
                        }
                    });
                }
            });
        }
    });
};

ChannelProvider.prototype.save = function(channels, callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof channels.length === 'undefined') {
                channels = [channels];
                for (var i = 0; i < channels.length; i++) {
                    channel = channels[i];
                    channel.created_at = new Date();

                    if (channel.users === undefined) {
                        channel.users = [];
                    }

                    for (var j = 0; j < channel.users.length; j++) {
                        channel.users[j].created_at = new Date();
                    }
                }

                channel_collection.findOne({'channel':channel.channel}, function(error, result) {
                    if (error) {
                        callback(error);
                    } else {
                        if (typeof result === 'undefined') {
                            channel_collection.insert(channels, function() {
                                callback(null, channels);
                            });
                        } else {
                            callback('channel exists', channels);
                        }
                    }
                });
            }
        }
    });
};

ChannelProvider.prototype.joinChannel = function(object, callback) {

    var channelId = object.channel;
    var user = object.user;
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            
            channel_collection.findAndModify(
                {_id: ObjectID.createFromHexString(channelId)},
                [['_id','asc']],
                {"$push": {users: user}},
                {},
                function(error, channel) {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, channel);

                    }
                }
            );
        }
    });
};

ChannelProvider.prototype.findByChannel = function(id, callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            channel_collection.findOne({ _id: ObjectID.createFromHexString(id) }, function(error, result) {
                if (error) {
                    callback(error);
                } else {
                    callback(null, result);
                }
            });
        }
    });
};

ChannelProvider.prototype.remove = function(id, callback) {
    this.getCollection(function(error, channel_collection) {
        if (error) {
            callback(error);
        } else {
            if (typeof id !== 'undefined') {
                channel_collection.remove( { _id: ObjectID.createFromHexString(id) }, function() {
                    callback(null, 'channel deleted');
                });
            }


        }
    });
};

exports.ChannelProvider = ChannelProvider;