def hello(args):
    name = args["name"] if "name" in args else "world" 
    print("name=%s" % name)
    return {"greeting": "Hello, %s" % name }
