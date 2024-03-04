"use strict";
/*
This library uses AVR-GCC in a Arduino environment
*/

// Enum for protocol data types
export const EProtocolDataType = {
  pdtMoveStepper: 1,
  pdtWriteEEprom: 2,
  pdtReadEEprom: 3,
};

// Structure for MoveStepperData
class TMoveStepperData {
  constructor(aID, aAmount) {
    this.size = 4;
    this.ID = aID;
    this.amount = aAmount;
  }

  toBytes() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);

    view.setUint16(0, this.ID, true);
    view.setUint16(2, this.amount, true);

    return new Uint8Array(buffer);
  }
}

// Structure for EEpromData
class TEEpromData {
  constructor(aAddress, aValue) {
    this.size = 6;
    this.address = aAddress;
    this.value = aValue;
  }

  toBytes() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);

    view.setInt16(0, this.address, true);
    view.setFloat32(2, this.value, true);

    return new Uint8Array(buffer);
  }
}

// Structure for the protocol
class TProtocol {
  constructor(aBytes, aDataType) {
    this.size = 4;
    this.bytes = aBytes + this.size;
    this.dataType = aDataType;
  }

  toBytes() {
    const buffer = new ArrayBuffer(this.size);
    const view = new DataView(buffer);

    view.setUint16(0, this.bytes, true);
    view.setUint16(2, this.dataType, true);

    return new Uint8Array(buffer);
  }
}


export function TArduinoProtocol(dataType, ...params) {
  let data, protocol;

  switch (dataType) {
    case EProtocolDataType.pdtMoveStepper:
      data = new TMoveStepperData(...params);
      break;
    case EProtocolDataType.pdtReadEEprom:
    case EProtocolDataType.pdtWriteEEprom:
      data = new TEEpromData(...params);
      break;
  
      // Add more cases for other data types if needed

    default:
      throw new Error("Unknown EProtocolDataType");
  }

  protocol = new TProtocol(data.size, dataType);

  const protocolBuffer = new Uint8Array(protocol.bytes);
  protocolBuffer.set(protocol.toBytes(), 0);
  protocolBuffer.set(data.toBytes(), protocol.size);

  return protocolBuffer;
}
