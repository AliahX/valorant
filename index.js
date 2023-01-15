page = "gunsPage";
activeGun = {};
error = false;
screen = 0;
storeScreenSetup = false;
canOpenFullscreen = true;
chapterVar = 0;

apiBaseURL = "https://valorant-api.com/v1/";
apiURLS = [
  "weapons",
  "weapons/skins",
  "themes",

  "bundles",

  "contracts",
  "agents",

  "sprays",
  "playercards",
  "playertitles",
  "buddies",
  "currencies"
]

apiData = {}

apiURLS.forEach((url, i) => {
  apiData[url.replace(/\//g, "")] = {};
  $.getJSON(apiBaseURL + url + "?isPlayableCharacter=true", function(data) {
    apiData[url.replace(/\//g, "")] = data.data;
    if(i == apiURLS.length - 1) {
      loadContractsPage();
      loadGunsPage();
      loadBundlesPage();
    }
  }).fail(function() {
    error = true;
    $("#mainBox").append(`<div class="errorMessage" onclick="window.location.reload(true);">
      <h2>Something went wrong</h2>
      <p>Error loading ${url.replace(/\//g, "")} data</p>
      <p>Try refreshing the page</p>
    </div>`);
  });
});

function findData(data, value, mode) {
  if(mode == null) {
    return apiData[data].find(e => e["uuid"] == value);
  } else {
    returnData = "";
    forEach(data, function(e) {
      e.levels.find(e => e.uuid == value) ? returnData = e : 0;
    });
    return returnData == "" ? apiData[data].find(e => e["uuid"] == value) : returnData;
  }
}

function findFromType(type, uuid) {
  switch(type) {
    case "Spray":
      data = findData("sprays", uuid);
      break;
    case "PlayerCard":
      data = findData("playercards", uuid);
      break;
    case "Title":
      data = findData("playertitles", uuid);
      break;
    case "Character":
      data = findData("agents", uuid);
      break;
    case "EquippableCharmLevel":
      data = findData("buddies", uuid, 1);
      break;
    case "EquippableSkinLevel":
      data = findData("weaponsskins", uuid, 1);
      break;
    case "Currency":
      data = findData("currencies", uuid);
      break;
    default:
      data = {};
      break;
  }
  return data;
}

function fullscreen(src, img, img2) {
  if(canOpenFullscreen) {
    if(src == 'null'){
      $(`<div class="fullscreen" onclick="$('.fullscreen').remove();">
          <div class="errorMessage">
            <h2>Preview not available.</h2>
          </div>
        </div>`).insertBefore("header")
    } else {
      if(img) {
        img2Dat = ``;
        if(img2) {
          img2Dat = `
          <img src="${img2}" draggable="false">`;
        }
        $(`<div class="fullscreen" onclick="$('.fullscreen').remove();">
            <img src="${src}" draggable="false">${img2Dat}
          </div>`).insertBefore("header")
      } else {
        $(`<div class="fullscreen" onclick="$('.fullscreen').remove();">
            <video draggable="false" autoplay loop>
              <source src="${src}" type="video/mp4">
            </video>
          </div>`).insertBefore("header")
      }
    }
  }
  canOpenFullscreen = true;
}

function setSkin(uuid) {
  $("#sideBox").show();
  if(page == "allSkinsPage") {setSideBox(findData("weaponsskins", uuid, 1))}
  data = findData("weaponsskins", uuid);
  $("#sideBox .gunName").text(data.displayName);
  if(data.contentTierUuid != null) {
    $("#sideBox .gunName").append(`<img src="https://media.valorant-api.com/contenttiers/${data.contentTierUuid}/displayicon.png" draggable="false">`)
  }
  $("#sideBox .gunImage").attr("src", data.chromas[0].fullRender);
  $("#sideBox .skinData *").remove();
  if(data.chromas.length > 1) {
    $(".skinData").append(`<div class="chromas"></div>`);
    data.chromas.forEach((element, i) => {
      if(element.displayName.indexOf("(") != -1) {
        title = element.displayName.split("(")[1].replace(")","");
      } else {
        title = "Base";
      }
      if(i == 0 && element.streamedVideo == null) {
        element.streamedVideo = data.levels[data.levels.length - 1].streamedVideo;
      }
      $(".chromas").append(`<img class="chroma" src="${element.swatch}" onclick="fullscreen('${element.streamedVideo}')" onmouseover="$('#sideBox .gunImage').attr('src', data.chromas[${i}].fullRender);" title="${title}" draggable="false">`);
    });
  }

  if(data.levels.length > 1) {
    $(".skinData").append(`<div class="levels"></div>`);
    data.levels.forEach((e, i) => {
      var title = e.levelItem;
      if(e.levelItem == null) {
        title = "Base";
      } else {
        title = title.split("::")[1];
      }
      $(".levels").append(`<div class="level" onclick="fullscreen('${e.streamedVideo}')" title="${title}"><span>LV${i + 1}</span></div>`);
    });
  }
}


function resetPage() {
  if(error) {
    window.location.reload(true);
  }
  $('#mainBox *').remove();
  $('#sideBox *').remove();
  $("#sideBox").hide();
  $("#searchInput")[0].value = "";
  activeGun = {};
}

function addGun(gunData) {
  $("#mainBox").append(`<div class="gunBox" id="${gunData.uuid}">
      <div class="gunName" collection="Standard">${gunData.displayName}</div>
      <img class="gunImage" src="${gunData.displayIcon}" alt="${gunData.displayName}" draggable="false">
    </div>`);  
}

function addContract(contractData) {
  if(contractData.content.relationType == "Agent") {
    forEach("agents", function(agent) {
      if(agent.uuid == contractData.content.relationUuid) {
        contractData.displayIcon = agent.displayIcon;
      }
    });
  }
  $("#contractsBox").append(`<div class="contractBox" id="${contractData.uuid}">
      <div class="contractName">${contractData.displayName}</div>
      <img class="contractImage" src="${contractData.displayIcon}" alt="${contractData.displayName}" draggable="false">
    </div>`);  
}

function addSkin(gunData) {
  if(page == "gunPage" || page == "allSkinsPage") {
    if(gunData.displayName.indexOf("Standard") != -1 || gunData.displayName == "Melee") {
      var gunName = gunData.displayName.replace(/Standard /, "");
      forEach("weapons", function(element){
        if(element.displayName == gunName) {gunData.levels[0].displayIcon = element.displayIcon;}
      })
    }
    collection = "";
    collection = findData("themes", gunData.themeUuid).displayName;
    $("#mainBox").append(`<div class="gunBox" id="${gunData.uuid}">
      <div class="gunName" collection="${collection}">${gunData.displayName}</div>
      <img class="gunImage" src="${gunData.levels[0].displayIcon}" alt="${gunData.displayName}" draggable="false">
    </div>`);
  }
}

function addBundle(bundleData) {
  $("#bundlesBox").append(`<div class="bundleBox" id="${bundleData.uuid}">
      <div class="bundleName">${bundleData.displayName}</div>
      <img class="bundleImage" src="${bundleData.displayIcon}" alt="${bundleData.displayName}" draggable="false">
  </div>`);
}

function loadGunsPage() {
  page = "gunsPage";
  forEach("weapons", addGun, '$(".gunBox").click(function() {loadGunPage($(this).attr("id"))})');
}

function loadContractsPage() {
  $("#contractsBox *").remove();
  page = "contractsPage";
  forEach("contracts", addContract, '$(".contractBox").click(function() {loadContractPage($(this).attr("id"))})');
}

function loadBundlesPage() {
  $("#bundlesBox *").remove();
  page = "bundlesPage";
  forEach("bundles", addBundle, '$(".bundleBox").click(function() {loadBundlePage($(this).attr("id"))})');
}

function loadGunPage(uuid) {
  resetPage();
  $("#sideBox").show();
  page = "gunPage";
  setSideBox(activeGun = findData("weapons", uuid));
  activeGun.skins.forEach(addSkin);
  $(".gunBox").click(function() {
    setSkin($(this).attr("id"));
  });
}

function loadContractPage(uuid) {
  $("#contractsBox *").remove();
  data = findData("contracts", uuid);
  chapterButtons = "<div class='tabs'>";
  data.content.chapters.forEach((e, i) => {
    if(i == 0 && data.content.chapters.length == 1) {
      chapterButtons += `<input class="tab" type="button" value="Chapter ${i + 1}" onclick="setChapter(${i})">`;
    } else if(i == 0) {
      chapterButtons += `<input class="tab left" type="button" value="Chapter ${i + 1}" onclick="setChapter(${i})">`;
    } else if(i > 0 && i < data.content.chapters.length - 1) {
      chapterButtons += `<input class="tab middle" type="button" value="Chapter ${i + 1}" onclick="setChapter(${i})">`;
    } else if(i > 0 && i == data.content.chapters.length - 1) {
      chapterButtons += `<input class="tab right" type="button" value="Chapter ${i + 1}" onclick="setChapter(${i})">`;
    }
  });
  chapterButtons += "</div>";

  $('#contractsBox').append(`<div class="wholeContractBox" id="${uuid}">
    <div class="contractName">${data.displayName}</div><br>
    ${chapterButtons}
    <div class="contractInfo"></div>
  </div>`);
  totalXP = 0;
  data.content.chapters.forEach((e, i) => {
    rewards = "";
    e.levels.forEach((reward) => {
      totalXP += reward.xp;
      xp = reward.xp == 0 ? "" : `\n<div>${reward.xp}XP | ${totalXP}XP</div>`;
      reward = reward.reward;    
      addReward(reward);
    });

    if(e.freeRewards) {
      rewards += `<fieldset><legend>Free Rewards</legend></fieldset>`
      e.freeRewards.forEach((reward) => {
        xp = "";
        addReward(reward)
      });
    }

    $(".contractInfo").append(`<div class="chapterBox" id="chapter${i}" style="display: none;">${rewards}</div>`);
  });

  $(".rewardBox").hover(function(e) {
    if(e.originalEvent.type == "mouseover") {
      this.classList.add("hover");
    } else {
      this.classList.remove("hover");
    }
  });

  $('#contractsBox .tabs input')[0].click();
}

function loadBundlePage(uuid) {
  $("#bundlesBox *").remove();
  data = findData("bundles", uuid);
  $('#bundlesBox').append(`<div class="wholeBundleBox" id="${uuid}">
    <div class="bundleName">${data.displayName}</div>
    <div class="bundleImages">
      <img src="${data.verticalPromoImage}">
      <img src="${data.displayIcon}">
    </div>
    ${data.displayNameSubText != null ? `<div class="bundleSubText">${data.displayNameSubText}</div>` : ""}
    ${data.description != null ? `<div class="bundleSubText">${data.description}</div>` : ""}
    ${data.extraDescription != null ? `<div class="bundleSubText">${data.extraDescription}</div>` : ""}
    ${data.promoDescription != null ? `<div class="bundleSubText">${data.promoDescription}</div>` : ""}
  </div>`);
}


function setSideBox(data) {
  $("#sideBox *").remove();
  $("#sideBox").append(`<div class="gunName">${data.displayName}</div>
    <img class="gunImage" src="${data.displayIcon}" draggable="false" onclick="fullscreen(this.src, 1)">
    <div class="skinData"></div>
    `);
  if(data.weaponStats != null) {
    damageString = "";
    for(i = 0; i < data.weaponStats.damageRanges.length; i++) {
      damageString += `<span>Body ${data.weaponStats.damageRanges[i].bodyDamage} | Head ${data.weaponStats.damageRanges[i].headDamage} | Leg ${data.weaponStats.damageRanges[i].legDamage}&nbsp;&nbsp;&nbsp;${data.weaponStats.damageRanges[i].rangeStartMeters}-${data.weaponStats.damageRanges[i].rangeEndMeters}m</span><br>`;
    }

    fireMode = data.weaponStats.fireMode == null ? "Full-Automatic" : "Semi-Automatic";
    altFireString = "";
    if(data.weaponStats.altFireType != null) {
      altFireString = `<span>Alt Fire:</span><br>`;
      if(data.weaponStats.altFireType == "EWeaponAltFireDisplayType::ADS") {
        featureString = "";
        if(data.weaponStats.feature != null) {
          if(data.weaponStats.feature == "EWeaponStatsFeature::DualZoom") {
            featureString = "Dual-";
          }
        }
        altFireString += `<span> - ${featureString}Zoom Mode (${data.weaponStats.adsStats.zoomMultiplier}x)</span><br>
        <span> - Fire Rate: ${data.weaponStats.adsStats.fireRate} rounds/sec</span><br>
        <span> - Speed multiplier: ${data.weaponStats.adsStats.runSpeedMultiplier * 100}%</span><br>`;
      } else if(data.weaponStats.altFireType == "EWeaponAltFireDisplayType::Shotgun") {
        
      } else if(data.weaponStats.altFireType == "EWeaponAltFireDisplayType::AirBurst") {

      }
      altFireString += "<br>";
    }

    $("#sideBox").append(`<div class="gunInfo">
        <span>&curren;${data.shopData.cost.toLocaleString()}</span><br><br>

        <span>Primary Fire:</span><br>
        <span> - ${fireMode}</span><br>
        <span> - Fire Rate: ${data.weaponStats.fireRate} rounds/sec</span><br>
        <span> - Speed multiplier: ${data.weaponStats.runSpeedMultiplier * 100}%</span><br><br>

        ${altFireString}

        <span>Damage${data.weaponStats.shotgunPelletCount != 1 ? ` (${data.weaponStats.shotgunPelletCount} pellets)` : ""}:</span><br>
        ${damageString}<br>

        <span>Magazine Capacity: ${data.weaponStats.magazineSize}</span><br>
        <span>Wall Penetration: ${data.weaponStats.wallPenetration.split("::")[1]}</span><br><br>

        <span>Equip Time: ${data.weaponStats.equipTimeSeconds}sec | Reload Time: ${data.weaponStats.reloadTimeSeconds}sec</span><br>
      </div>
    `);
  }
}

function addReward(reward) {
  data = findFromType(reward.type, reward.uuid);
  image = "";
  fullscreenCode = "";
  prefix = "";
  openButton = "";
  switch(reward.type) {
    case "Title":
      image = `<div>${data.titleText}</div>`;
      break;
    case "EquippableSkinLevel":
      image = `<img src="${data.levels[0].displayIcon}" class="rewardImage" draggable="false">`;
      a = reward;
      fullscreenCode = ` onclick="fullscreen('${data.levels[0].displayIcon}', 1)"`;
      openButton = `<div class="openInSkinsTab" onclick="openInSkinsTab('${data.uuid}')">Open in Skins Tab</div>`;
      break;
    default:
      hdImage = data.displayIcon;
      hdImage2 = "";
      switch(reward.type) {
        case "Spray":
          hdImage = data.fullTransparentIcon;
          break;
        case "PlayerCard":
          hdImage = data.largeArt;
          hdImage2 = `, '${data.wideArt}'`;
          break;
        case "Character":
          hdImage = data.fullPortrait;
          break;
        case "Currency":
          if(reward.uuid == "e59aa87c-4cbf-517a-5983-6e81511be9b7") {
            prefix = "10 ";
            if(reward.amount != 1) {
              prefix = reward.amount + " ";
            }
          }
          break;
        case "EquippableCharmLevel":
          prefix = "2x ";
          if(reward.amount != 1) {
            prefix = reward.amount + "x ";
          }
          break;
      }
      image = `<img src="${data.displayIcon}" class="rewardImage" draggable="false">`;
      fullscreenCode = ` onclick="fullscreen('${hdImage}', 1${hdImage2})"`;
      break;
  }
  rewards += `<div class="rewardBox"${fullscreenCode}>
    <div>${prefix + data.displayName}</div>
    ${image}${xp}
    ${openButton}
  </div>`;
}

function loadAllSkins() {
  resetPage();
  page = "allSkinsPage";  
  activeGun = {};
  forEach("weaponsskins", addSkin);
  $(".gunBox").click(function() {
    setSkin($(this).attr("id"));
  });
}

function search(input) {
  $(".gunBox").each(function() {
    e = $(this);
    e.find(".gunName").text().toLowerCase().includes(input.value.toLowerCase()) == -1 && e.find(".gunName").attr("collection").toLowerCase().indexOf(input.value.toLowerCase()) == -1 ? e.hide() : e.show();
  });
  $(".contractBox").each(function() {
    e = $(this);
    e.find(".contractName").text().toLowerCase().indexOf(input.value.toLowerCase()) == -1 ? e.hide() : e.show();
  });
}

function setScreen(sc) {
  screen = sc;
  localStorage.setItem("screen", sc);

  $("#topBar .tabs .tab").removeClass("active");
  $("#storeBox").addClass("hidden");
  $("#contractsBox").addClass("hidden");
  $("#mainBox").addClass("hidden");
  $("#sideBox").addClass("hidden");
  $("#bundlesBox").addClass("hidden");

  switch(sc) {
    case 0:
      $("#topBar .tabs .tab.left").addClass("active");
      $("#mainBox").removeClass("hidden");
      $("#sideBox").removeClass("hidden");
      break;
    case 1:
      $("#topBar .tabs .tab.right").addClass("active");
      $("#storeBox").removeClass("hidden");
      if(storeScreenSetup == false) {
        setupStoreScreen();
      }
      break;
    case 2:
      $("#topBar .tabs .tab.middle:first").addClass("active");
      $("#contractsBox").removeClass("hidden");
      break;
    case 3:
      $("#topBar .tabs .tab.middle:eq(1)").addClass("active");
      $("#bundlesBox").removeClass("hidden");
  }
}

function setupStoreScreen() {
  $("#usernameInput")[0].value = "";
  $("#passwordInput")[0].value = "";
  if(localStorage.getItem("accounts") == null) {
    localStorage.setItem("accounts", JSON.stringify([]));
  }
  $("#storeBox .accountBox:not(.default)").remove();
  accounts = JSON.parse(localStorage.getItem("accounts"));
  accounts.forEach((element) => {
    $("#storeBox").prepend(`<div class="accountBox" id="${element.id}">
      <div class="accountName">${element.id}</div>
      <div class="accountButtons">
        <input type="button" class="accountInput add" value="╳" onclick="deleteAccount('${element.id}')">
      </div>
      <div class="storeBox">
      </div>
    </div>`)
  })
}

function addAccount() {
  error = false;
  username = $("#usernameInput")[0].value;
  password = $("#passwordInput")[0].value;
  region = $("#regionInput")[0].value;
  error = username == "" || password == "";
  accounts.forEach((element) => {
    if(element.id == username) {
      error = true;
    }
  });
  if(error) {
    return;
  }
  accounts.push({
    id: username,
    password: password,
    region: region
  });
  localStorage.setItem("accounts", JSON.stringify(accounts));
  setupStoreScreen();
}

function deleteAccount(id) {
  $(".accountBox#" + id).remove();
  accounts.forEach((element) => {
    if(element.id == id) {
      accounts.splice(accounts.indexOf(element), 1);
    }
  })
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

function setChapter(chapter) {
  chapterVar = chapter;
  $(".wholeContractBox .tabs .tab").removeClass("active");
  $(".wholeContractBox .tabs .tab")[chapter].classList.add("active");
  $(`.wholeContractBox .contractInfo .chapterBox`).hide();
  $(`.wholeContractBox .contractInfo #chapter${chapter}`).show();
}

function openInSkinsTab(uuid) {
  canOpenFullscreen = false;
  setScreen(0);
  loadAllSkins();
  setSkin(uuid);
  $('#mainBox').scrollTop($('#' + uuid).offset().top - 182 + $('#mainBox').scrollTop());
}

$(window).keydown(function(event) {
  target = event.originalEvent.target;
  if(Array.from($("#topBar .tabs ")[0].children).indexOf(target) == -1 && target != $("#searchInput")[0] && screen == 2) {
    if(event.originalEvent.key == "ArrowRight") {
      if($(".tabs")[1].children[chapterVar + 1]) {
        setChapter(chapterVar + 1)
      }
    } else if(event.originalEvent.key == "ArrowLeft") {
      if($(".tabs")[1].children[chapterVar - 1]) {
        setChapter(chapterVar - 1)
      }
    }
  }
});

function forEach(arrName, callback, finishCallback) {
	try {
		apiData[arrName].forEach(callback);
    new Function(finishCallback)();
	} catch (e){
    e = (e.message.indexOf("not a function") == -1 ? e : "");
    console.error("error loading " + arrName, e);
    setTimeout(function(){
      forEach(arrName, callback, finishCallback);
    }, 1000);
	}
}






function fullscreenRewardInfo(reward) {
  console.log(reward);
  data = findFromType(reward.type, reward.uuid);
  console.log(data);
  if(canOpenFullscreen) {
    $(`<div class="fullscreen" onclick="$('.fullscreen').remove();">
        <div class="imageBox">hi</div>
        <div class="infoBox">
        <span>${data.displayName}</span><br>
        <span><b>Type: </b> ${reward.type}</span
        </div>
      </div>`).insertBefore("header")
  }
}
