#The code to accompany the Spatial Node Mongo blog piece

This code actually belongs to a [blog piece](https://www.openshift.com/blogs/set-up-nodejs-mongodb-and-express-on-free-spatial-web-hosting) written on OpenShift.com 

========

Running on OpenShift
--------------------

Create an account at https://www.openshift.com

Create a Node.js application with MongoDB

    rhc app create nodews nodejs-0.10 mongodb-2 --from-code=https://github.com/openshift-quickstart/openshift-mongo-node-express-example.git

By default flag ```--from-code``` will add this repository as an upstream, which can be use later to pull updates.

Now, ssh into the application.

    rhc ssh

Add the data to a collection called parkpoints:

    mongoimport -d nodews -c parkpoints --type json --file $OPENSHIFT_REPO_DIR/parkcoord.json  -h $OPENSHIFT_MONGODB_DB_HOST  -u admin -p $OPENSHIFT_MONGODB_DB_PASSWORD
    
Create the spatial index on the documents:

    mongo
    use nodews
    db.parkpoints.ensureIndex( { pos : "2d" } );

Once the data is imported you can now checkout your application at:

    http://nodews-$yournamespace.rhcloud.com/ws/parks


License
-------

This code is dedicated to the public domain to the maximum extent
permitted by applicable law, pursuant to CC0
http://creativecommons.org/publicdomain/zero/1.0/
