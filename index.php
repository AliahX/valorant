<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Valorant</title>
    <script src="https://code.jquery.com/jquery-3.6.1.min.js"></script>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:400,400i,700,700i,600,600i" />
    <link rel="stylesheet" href="https://kit-pro.fontawesome.com/releases/v5.15.4/css/pro.min.css">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png"/>
    <script src="index.js" charset="utf-8"></script>
    <link rel="stylesheet" href="index.css">
  </head>
  <body>
    <header>
      <h1>Valorant</h1>
    </header>
    <div id="topBar">
      <div class="homeButton" onclick="resetPage(); loadGunsPage(); loadContractsPage(); loadBundlesPage()" title="Home">
        <i class="fas fa-home"></i>
      </div>
      <div class="showAllSkinsButton" onclick="loadAllSkins();" title="Show all skins">
        <i class="fas fa-eye"></i>
      </div>
      <div class="searchBar">
        <i class="fas fa-search"></i>
        <input type="text" id="searchInput" placeholder="Search..." oninput="search(this);">
      </div>
      <div class="tabs">
        <input class="tab left" type="button" value="Skins" onclick="setScreen(0)"><input class="tab middle" type="button" value="Contracts" onclick="setScreen(2)"><input class="tab middle" type="button" value="Bundles" onclick="setScreen(3)"><input class="tab right" type="button" value="Store" onclick="setScreen(1)">
      </div>
    </div>
    <div id="sideBox"></div>
    <div id="mainBox" class="contentBox"></div>
    <div id="storeBox" class="contentBox">
      <div class="accountBox default">
        <h2>Add Account</h2>
        <table>
          <tr>
            <td>Username:</td>
            <td><input type="text" id="usernameInput" class="accountInput"></td>
          </tr>
          <tr>
            <td>Password:</td>
            <td><input type="password" id="passwordInput" class="accountInput"></td>
          </tr>
          <tr>
            <td>Region:</td>
            <td>
              <select class="accountInput" id="regionInput">
                <option value="ap">AP</option>
                <option value="na">NA</option>
                <option value="eu">EU</option>
                <option value="kr">KR</option>
              </select>
              <input type="button" value="+" onclick="addAccount()" class="accountInput add">
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div id="contractsBox" class="contentBox"></div>
    <div id="bundlesBox" class="contentBox"></div>
    <script>
      resetPage();
      if(localStorage.getItem("screen") == null) {
        localStorage.setItem("screen", 0);
        setScreen(0);
      } else {
        setScreen(parseInt(localStorage.getItem("screen")));
      }
    </script>
  </body>
</html>
