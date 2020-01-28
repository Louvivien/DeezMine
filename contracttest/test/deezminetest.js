const Deezmine = artifacts.require("Deezmine");
const truffleAssert = require("truffle-assertions");

contract("Deezmine", async accounts => {
  let instance;

  before(async () => {
    instance = await Deezmine.deployed();
    balanceInstrumentBefore = await web3.eth.getBalance(accounts[4]);
  });

  it("Doit check-in un instrument", async () => {
    await instance.checkInInstrument(
      "Fender",
      "Stratocaster",
      "Guitar",
      "Fender-Stratocaster-Guitar",
      "20200123111",
      accounts[4],
      "Hash-Picture",
      { value: web3.utils.toWei("10", "finney") }
    );
    let brandInstrument = await instance.brand(accounts[4]);
    let modelInstrument = await instance.model(accounts[4]);
    let typeInstrument = await instance.instrumentType(accounts[4]);
    let instrumentName = await instance.name(accounts[4]);
    let serialInstrument = await instance.serialNumber(accounts[4]);
    let instrumentExist = await instance.exist(accounts[4]);
    let balanceInstrumentAfter = await web3.eth.getBalance(accounts[4]);
    let balanceDifference = balanceInstrumentAfter - balanceInstrumentBefore;
    assert(
      instrumentName === "Fender-Stratocaster-Guitar" &&
        brandInstrument === "Fender" &&
        modelInstrument === "Stratocaster" &&
        typeInstrument === "Guitar" &&
        serialInstrument === "20200123111" &&
        instrumentExist === true &&
        balanceDifference == web3.utils.toWei("10", "finney")
    );
  });

  it("Doit etre un echec car pas assez de value", async () => {
    await truffleAssert.fails(
      instance.checkInInstrument(
        "Fender",
        "Stratocaster",
        "Guitar",
        "Fender-Stratocaster-Guitar",
        "20200123111",
        accounts[5],
        "Hash-Picture",
        { value: web3.utils.toWei("1", "finney") }
      ),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("Doit etre un echec car ID déjà utilisée", async () => {
    await truffleAssert.fails(
      instance.checkInInstrument(
        "Fender",
        "Stratocaster",
        "Guitar",
        "Fender-Stratocaster-Guitar",
        "20200123111",
        accounts[1],
        "Hash-Picture",
        { value: web3.utils.toWei("10", "finney") }
      ),
      truffleAssert.ErrorType.REVERT
    );
  });

  it("Take ownership doit echouer car n'existe pas ", async () => {
    await truffleAssert.fails(
      instance.takeOwnership("a@a.com", "Sly", accounts[6], {
        from: accounts[5]
      })
    ),
      truffleAssert.ErrorType.REVERT;
  });

  it("Take Ownership OK pour un proprio sans instrument", async () => {
    await instance.takeOwnership("a@a.com", "Sly", accounts[5], {
      from: accounts[1]
    });

    let ownerInstrument = await instance.owner(accounts[1]);
    let mailInstrument = await instance.ownerMail(accounts[1]);
    let nickNameInstrument = await instance.ownerNickName(accounts[1]);
    let ownerOfInstrument = await instance.ownerOf(accounts[5], 0);

    assert(
      ownerInstrument === accounts[5] &&
        mailInstrument === "a@a.com" &&
        nickNameInstrument === "Sly" &&
        ownerOfInstrument === accounts[1]
    );
  });

  it("Take Ownership OK pour un proprio qui a déjà un instrument", async () => {
    await instance.takeOwnership("a@a.com", "Sly", accounts[3], {
      from: accounts[1]
    });

    let ownerInstrument = await instance.owner(accounts[1]);
    let mailInstrument = await instance.ownerMail(accounts[1]);
    let nickNameInstrument = await instance.ownerNickName(accounts[1]);
    let ownerOfInstrument = await instance.ownerOf(accounts[3], 1);

    assert(
      ownerInstrument === accounts[3] &&
        mailInstrument === "a@a.com" &&
        nickNameInstrument === "Sly" &&
        ownerOfInstrument === accounts[1]
    );
  });

  it("transfer d'un instrument d'un wallet à un autre OK", async () => {
    await instance.transfer(accounts[2], accounts[6], "Bob", "b@b.com", {
      from: accounts[3]
    });

    let ownerInstrument = await instance.owner(accounts[2]);
    let mailInstrument = await instance.ownerMail(accounts[2]);
    let nickNameInstrument = await instance.ownerNickName(accounts[2]);
    let ownerOfInstrument = await instance.ownerOf(accounts[6], 0);

    assert(
      ownerInstrument === accounts[6] &&
        mailInstrument === "b@b.com" &&
        nickNameInstrument === "Bob" &&
        ownerOfInstrument === accounts[2]
    );
  });
});
