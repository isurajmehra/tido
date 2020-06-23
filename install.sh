if [[ $OSTYPE == 'linux-gnu'* ]]; then
  [ "$UID" -eq 0 ] || exec sudo $BASH "$0" "$@"
fi

TIDO_ROOT=$PWD

if [[ $OSTYPE == 'linux-android'* ]]; then
  SAVE_ROOT=/data/data/com.termux/files/home/storage
  BIN_PATH=/data/data/com.termux/files/usr/bin
elif [[ $OSTYPE == 'linux-gnu'* ]]; then
  SAVE_ROOT=$PWD
  BIN_PATH=/usr/bin
fi

touch $BIN_PATH/tido
rm $BIN_PATH/tido
touch $BIN_PATH/tido

if type -P node > /dev/null == ''; then
  echo 'Node.JS is not installed. Installing Node.JS...'

  apt install nodejs  
else
  echo 'Node.JS is installed'
fi


if [[ $OSTYPE == 'linux-android'* ]]; then
  termux-setup-storage
fi

echo 'Installing dependencies...'

npm install > /dev/null;

echo 'Saving executable...'
COMMAND='OLD_PATH=$PWD\ncd '$TIDO_ROOT'\nnode index.js '$SAVE_ROOT' $*\ncd $OLD_PATH'

echo -e $COMMAND > $BIN_PATH/tido
chmod 777 $BIN_PATH/tido
echo 'Done!'