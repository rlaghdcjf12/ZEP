const MY_NAME = 'MI 한스';

let players = [];

App.onInit.Add(function () {
  App.cameraEffect = 1;
  App.cameraEffectParam1 = 1000;
});

App.onJoinPlayer.Add(function (player) {
  player.tag = { sturn: false, sTime: 2 };
  player.displayRatio = player.isMobile ? 1 : 1.5;

  openDialog(player, { type: 1, id: 0 });

  savePlayer(player);
});

App.onObjectTouched.Add(function (sender, x, y, tileID, obj) {
  if (obj !== null) {
    if (obj.type == ObjectEffectType.INTERACTION_WITH_ZEPSCRIPTS) {
      if (obj.text == 1) openDialog(sender, { type: 1, id: obj.param1 });
    }
  }
});

App.addOnKeyDown(27, function (player) {
  closeDialog(player);
});

const savePlayer = (player) => {
  player.sendUpdated();
  players = App.players;
};

const openDialog = (player, { type, id }) => {
  if (player.tag.widgetDialog == null) {
    player.tag.widgetDialog = player.showWidgetResponsive(
      `widget/normal.html`,
      player.isMobile ? 20 : 35,
      player.isMobile ? 5 : 25,
      player.isMobile ? 20 : 35,
      player.isMobile ? 5 : 25
    );
    player.tag.widgetDialog.onMessage.Add((player, msg) => handleDialogMessage(player, msg));
  }

  player.tag.widgetDialog.sendMessage({
    type,
    id,
  });
};

const handleDialogMessage = (player, msg) => {
  if (msg.type == 'closeDialog') {
    closeDialog(player);
  }
};

const closeDialog = (player) => {
  if (player.tag.widgetDialog != null) {
    player.tag.widgetDialog.destroy();
    player.tag.widgetDialog = null;
  }
};
