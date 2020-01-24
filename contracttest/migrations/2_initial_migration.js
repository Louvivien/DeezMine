const Deezmine = artifacts.require("Deezmine");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Deezmine).then(async () => {
    let instance = await Deezmine.deployed();
    await instance.checkInInstrument(
      "Fender",
      "Stratocaster",
      "Guitar",
      "Fender-Stratocaster-Guitar",
      "20200123111",
      accounts[1],
      "Hash-Picture",
      { value: web3.utils.toWei("10", "finney") }
    );
    await instance.checkInInstrument(
      "Fender2",
      "Stratocaster2",
      "Guitar2",
      "Fender-Stratocaster-Guitar2",
      "202001231112",
      accounts[2],
      "Hash-Picture",
      { value: web3.utils.toWei("10", "finney") }
    );
    await instance.takeOwnership("a@a.com", "Sly", accounts[3], {
      from: accounts[2]
    });
  });
};
