pragma solidity ^0.5.0;

import "./safemath.sol";

contract Deezmine {
    
    using SafeMath for uint256;
    
    // J'ai pris le parti pris de ne pas utiliser le standard ERC721 que je ne trouve pas adapté à ce cas de figure.
    
    address ownerOfContract;
    
    event newInstrument(address _id,uint _date, string _name, string _serialNumber); 
    event newOwner(address _id, uint date, string _ownerNickName);
    event hasBeenStolenOrLost(address _id, uint date, string _message);
    event hasBeenRecover(address _id, uint date, string _message);
    event warningAlarm(address _id, uint date, string _location);
    event historyEvent(address _id,uint _date, string _details);
    
    
    // Caractéristique d'un instrument. Celui-ci est représenté par une adresse 
    
    mapping (address => string) public brand;
    mapping (address => string) public model;
    mapping (address => string) public instrumentType;
    mapping (address => string) public name;
    mapping (address => address) public owner;
    mapping (address => string) public ownerMail;
    mapping (address => string) public ownerNickName;
    mapping (address => uint) public birthDateOfInstrument;
    mapping (address => string) public serialNumber;
    
    
    mapping (address => bool) public exist;
    mapping (address => bool) public isStolenOrLost; 
    
    
    //-------------------------------------------------------------------------//
    //--------------Enregistrement et transfer de l'instrument-----------------//
    //-------------------------------------------------------------------------//
    
    // Enregistrement de l'instrument sur la blockchain par le fabricant.
    // Une app JS créerra un jeu de clé privée et adresse, l'adresse sera inscrite sur le tag NFC de l'instrument et la clé privée sera inscrite sur un chip NFC format carte de crédit et crypté par mot de passe .
    function checkInInstrument(string memory _brand, string memory _model, string memory _instrumentType, string memory _name, string memory _serialNumber, address payable _id) payable public { 
        require(exist[_id] == false);
        require(msg.value>= 1 finney);
        exist[_id] = true;
        
        brand[_id] = _brand;
        model[_id] = _model;
        instrumentType[_id] = _instrumentType;
        name[_id] = _name; // name est une concaténation de marque-model-type( ex: Fender-Stratocaster-Guitar).
        
        birthDateOfInstrument[_id] = now;
        serialNumber[_id] = _serialNumber;
        // Le fabricant transfert 1 Finney sur l'adresse de l'instrument pour que le futur propriétaire puisse inscrire ses infos sans avoir besoin d'acheter de l'ether.
        (_id).transfer(msg.value);
        
        emit newInstrument(_id,now, _name, _serialNumber );
    }
   
    // La prise de possession de l'instrument sera faite via l'appli mobile.
    // Le "client" scan le ship NFC de l'instrument , puis scan la clé privée du ship NFC format carte de crédit.
    // Le proprio pourra s'il le souhaite inscrire un email.
    // Il est possible d'utiliser cette fonction pour transférer l'instrument à un new Owner. 
    function takeOwnership(string memory _ownerMail, string memory _ownerNickName, address _ownerAdrress) public {
        require(exist[msg.sender]==true);
        // Il sera possible, si le nouveau proprio possède un wallet, d'inscrire l'adresse de son wallet comme propriétaire de l'instru.
        // option facultative 
        if(_ownerAdrress != address(0x0)){
            owner[msg.sender] = _ownerAdrress;
        } else {
            owner[msg.sender] = msg.sender;
        }
 
        ownerMail[msg.sender] = _ownerMail;
        ownerNickName[msg.sender] = _ownerNickName;
        emit newOwner(msg.sender,now,_ownerNickName);
    }
    
     modifier isOwner(address _id){
        require(owner[_id] == msg.sender);
        _;
    }
    
    // Méthode de transfer de particulier à particulier en cas de perte du ship NFC format carte de crédit.
    // Le owner doit connaitre l'address du futur owner, et avoir déjà inscrit son adresse comme propriétaire de l'instru.
    // le new owner doit créer un wallet auparavent.
    function transfer(address _id, address _futurOwner) public isOwner(_id){
        owner[_id] = _futurOwner;
        emit newOwner(_id,now, "NoName");
    }
    
    // fonction equivalente à takeOwnership dans le cas ou la clé NFC ait été perdu.
    function changeOwnerName(address _id, string memory _newOwnerNickName, string memory _newOwnerMail) public isOwner(_id){
        
        ownerNickName[_id] = _newOwnerNickName;
        ownerMail[_id] = _newOwnerMail;
        emit newOwner(msg.sender,now,_newOwnerNickName);
    }
  
    
    //-------------------------------------------------------------------------//
    //---------------------Déclaration de vol ou de perte----------------------//
    //-------------------------------------------------------------------------//
    
    // Un owner peut déclarer son intrument volé ou perdu. 
    function declareStolenOrLost(address _id, string memory _message) public isOwner(_id){
        isStolenOrLost[_id] = true;
        emit hasBeenStolenOrLost(_id,now,_message);
    }
    
    // Le owner est le seul à pouvoir pretendre avoir retrouvé son instrument. 
    function declareRecover(address _id, string memory _message) public isOwner(_id){
        isStolenOrLost[_id] = false;
        emit hasBeenRecover(_id, now, _message);
    }
    
    // L'applis React, chargera au démmarrage un array des instruments declarés volés ou perdus
    // en scannant l'instrument, elle va comparer l'id avec le array, et lancer la fonction d'alerte.
     function stolenOrLostTest(address _id , string memory _location) public returns(string memory){
        if(isStolenOrLost[_id] == true){
             return("warning !!!");
             emit warningAlarm(_id, now, _location);
        }
    }
  
    
    //-------------------------------------------------------------------------//
    //----------------------Historique de l'instrument-------------------------//
    //-------------------------------------------------------------------------//
    
    mapping (address => uint) public numberOfStories;
    mapping (address => string[]) public storieOfInstrument;
    
    // fonction permettant de concaténer 2 string 
    function append(string memory a,string memory b, string memory c) internal pure returns (string memory) {
    return string(abi.encodePacked(a, b, c));
    }
    
    // fonction permettant de transformer uint en string
      function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
        return "0";
    }
    uint j = _i;
    uint len;
    while (j != 0) {
        len++;
        j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len - 1;
    while (_i != 0) {
        bstr[k--] = byte(uint8(48 + _i % 10));
        _i /= 10;
    }
    return string(bstr);
}
    
    // 2 possibilités: avec l'adresse de l'owner, avec la clé privée de l'instru.
    function createStory (address _id , string memory _details) public isOwner(_id){
        emit historyEvent(_id,now,_details);
        
        
        string memory concatNowDetails = append(uint2str(now),"=>",_details) ;
        numberOfStories[_id] = numberOfStories[_id].add(1);
        storieOfInstrument[_id].push(concatNowDetails);
    }
    
     function createStoryWithKey (string memory _details) public {
        emit historyEvent(msg.sender,now,_details);
        string memory concatNowDetails = append(uint2str(now),"=>",_details) ;
        storieOfInstrument[msg.sender].push(concatNowDetails);
        numberOfStories[msg.sender] = numberOfStories[msg.sender].add(1);
    }
    
    function viewStorie (address _id, uint _idStory) public view returns(string memory _story){
        return(storieOfInstrument[_id][_idStory]);
    }
    

}