# kafka-util-cli
CLI with utility commands to make working with Kafka easier

# Setup
    You will need NodeJS (prefer LTS versions)

1. Clone this repository:
```bash
git clone git@github.com:tatsumibruno/kafka-util-cli.git
```
2. Go to project directory and install it globally:
```bash
cd $HOME/projects/kafka-util-cli
npm install -g
```

# Running
    On the first execution, the CLI will ask the settings and store it in your `home` directory

```bash
 $ kafka-cli run
  _  __      __ _           _   _ _   _ _        ____ _     ___ 
 | |/ /__ _ / _| | ____ _  | | | | |_(_) |___   / ___| |   |_ _|
 | ' // _` | |_| |/ / _` | | | | | __| | / __| | |   | |    | | 
 | . \ (_| |  _|   < (_| | | |_| | |_| | \__ \ | |___| |___ | | 
 |_|\_\__,_|_| |_|\_\__,_|  \___/ \__|_|_|___/  \____|_____|___|
                                                                
by Bruno Tatsumi [https://github.com/tatsumibruno]
? Wich command do you want to execute? (Use arrow keys)
❯ List topics 
  List all existing consumer groups 
  Check offset 
  Reset offset 

```