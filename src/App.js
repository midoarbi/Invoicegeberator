import React, { useState } from 'react';
import {
  Button,
  Col,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  PageHeader,
} from 'react-bootstrap';
import { symbols } from 'currencyformatter.js';
import dequal from 'dequal';
import 'bootstrap/dist/css/bootstrap.css';

import './App.css';
import HistoryList from './HistoryList';
import LineItemList from './LineItemList.js';
import { saveInvoicePDF } from './PDFService.js';
import useLocalStorage from './useLocalStorage.ts';

const currencyCodes = Object.keys(symbols);

const emptyState = {
  invoiceNumber: '',
  fromName: '',
  imageLogo: null,
  paymentTerms: '',
  currency: 'USD',
  toName: '',
  date: '',
  dueDate: '',
  lineItems: [],
  notes: '',
  terms: '',
};

function App() {
  const [editedInvoice, setEditedInvoice] = useState(emptyState);
  const [historyStates, setHistoryStates] = useLocalStorage(
    'invoiceHistory',
    [],
  );

  function onFieldValueChange(propertyName, event) {
    let newVal = event.target.value;
    let stateUpdate = {};
    stateUpdate[propertyName] = newVal;
    setEditedInvoice({
      ...editedInvoice,
      ...stateUpdate,
    });
  }

  function onImageLogoChange(event) {
    let files = event.target.files;
    let stateUpdate = {};
    if (files.length > 0) {
      stateUpdate.imageLogo = files[0];
    }
    setEditedInvoice({ ...editedInvoice, ...stateUpdate });
  }

  function onLineItemDescriptionChange(params) {
    let lineItems = editedInvoice.lineItems;
    let lineItem = lineItems[params.index];
    lineItem.description = params.newDescription;
    setEditedInvoice({
      ...editedInvoice,
      lineItems: lineItems,
    });
  }

  function onLineItemQuantityChange(params) {
    let lineItems = editedInvoice.lineItems;
    let lineItem = lineItems[params.index];
    lineItem.quantity = params.newQuantity;
    setEditedInvoice({
      ...editedInvoice,
      lineItems: lineItems,
    });
  }

  function onLineItemRateChange(params) {
    let lineItems = editedInvoice.lineItems;
    let lineItem = lineItems[params.index];
    lineItem.rate = params.newRate;
    setEditedInvoice({
      ...editedInvoice,
      lineItems: lineItems,
    });
  }

  function onLineItemDeleteClick(params) {
    let lineItems = editedInvoice.lineItems;
    lineItems.splice(params.index, 1);
    setEditedInvoice({
      ...editedInvoice,
      lineItems: lineItems,
    });
  }

  function onLineItemAddClick() {
    let lineItems = editedInvoice.lineItems;
    lineItems.push({
      description: '',
      quantity: 0,
      rate: 0,
    });
    setEditedInvoice({
      ...editedInvoice,
      lineItems: lineItems,
    });
  }

  function onExampleLinkClick() {
    setEditedInvoice({
      ...editedInvoice,
      invoiceNumber: '123',
      fromName: 'El Mehdi Nassiri\n Hay Mohamadi\nMaroc, Casablanca 20000',
      imageLogo: null,
      paymentTerms: 'Projet à prix fixe',
      currency: 'MAD',
      toName: 'Ahmed taha alami\n sidi bernoussi.\nMaroc, Casablanca 20001',
      date: '2020-06-06',
      dueDate: '2020-06-26',
      lineItems: [
        {
          description: 'Front End React js #1',
          quantity: 1,
          rate: 1.5,
        },
        {
          description: 'Blockchain Integration #2',
          quantity: 2,
          rate: 2.5,
        },
      ],
      notes: 'ce projet a fait par moi el mehdi nassiri en tant que Freelancer',
      terms: 'Le paiement doit être effectué via PayPal, Cih bank',
    });
  }

  function onClearFormClick() {
    setEditedInvoice(emptyState);
  }

  function onRemoveImageClick() {
    // Clear out the input file element
    let inputElem = document.getElementById('imageLogo');
    inputElem.value = '';

    // Clear out the imageLogo on the state
    setEditedInvoice({
      ...editedInvoice,
      imageLogo: null,
    });
  }

  function onSubmitClick() {
    saveInvoicePDF(editedInvoice);
    if (!dequal(editedInvoice, historyStates[0])) {
      setHistoryStates([editedInvoice, ...historyStates.slice(0, 24)]);
    }
  }

  function onHistoryStateClick(historyState) {
    setEditedInvoice(historyState);
  }

  return (
    <div className="App">
      <div>
        <PageHeader>générateur de factures</PageHeader>
        <p>
        Il s'agit d'un générateur de factures. Remplissez les champs ci-dessous et cliquez sur
           «Créer une facture» pour générer la facture en tant que document PDF.{' '}
          <button onClick={onExampleLinkClick}>Click here</button> to see an
          example.
        </p>
        <div className="App-invoice">
          <Form horizontal>
            <FormGroup controlId="invoiceNumber">
              <Col componentClass={ControlLabel} sm={2}>
                Invoice #
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={editedInvoice.invoiceNumber}
                  onChange={onFieldValueChange.bind(this, 'invoiceNumber')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="fromName">
              <Col componentClass={ControlLabel} sm={2}>
                From
              </Col>
              <Col sm={10}>
                <FormControl
                  componentClass="textarea"
                  rows="3"
                  placeholder="De qui provient cette facture?"
                  value={editedInvoice.fromName}
                  onChange={onFieldValueChange.bind(this, 'fromName')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="imageLogo">
              <Col componentClass={ControlLabel} sm={2}>
                Logo
              </Col>
              <Col sm={10}>
                <FormControl
                  type="file"
                  onChange={onImageLogoChange.bind(this)}
                />
                {editedInvoice.imageLogo ? (
                  <button onClick={onRemoveImageClick}>Remove image</button>
                ) : null}
              </Col>
            </FormGroup>
            <FormGroup controlId="toName">
              <Col componentClass={ControlLabel} sm={2}>
                Bill To
              </Col>
              <Col sm={10}>
                <FormControl
                  componentClass="textarea"
                  rows="3"
                  placeholder="À qui est adressée cette facture? "
                  value={editedInvoice.toName}
                  onChange={onFieldValueChange.bind(this, 'toName')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="date">
              <Col componentClass={ControlLabel} sm={2}>
                Date
              </Col>
              <Col sm={10}>
                <FormControl
                  type="date"
                  value={editedInvoice.date}
                  onChange={onFieldValueChange.bind(this, 'date')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="dueDate">
              <Col componentClass={ControlLabel} sm={2}>
                Due Date
              </Col>
              <Col sm={10}>
                <FormControl
                  type="date"
                  value={editedInvoice.dueDate}
                  onChange={onFieldValueChange.bind(this, 'dueDate')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="paymentTerms">
              <Col componentClass={ControlLabel} sm={2}>
                Payment Terms
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={editedInvoice.paymentTerms}
                  onChange={onFieldValueChange.bind(this, 'paymentTerms')}
                />
              </Col>
            </FormGroup>
            <FormGroup controlId="currency">
              <Col componentClass={ControlLabel} sm={2}>
                Currency
              </Col>
              <Col sm={10}>
                <FormControl
                  componentClass="select"
                  placeholder="Sélectionnez la devise"
                  defaultValue={editedInvoice.currency}
                  onChange={onFieldValueChange.bind(this, 'currency')}
                >
                  {currencyCodes.map((currencyCode, index) => (
                    <option value={currencyCode} key={index}>
                      {currencyCode}
                    </option>
                  ))}
                </FormControl>
              </Col>
            </FormGroup>
            <LineItemList
              lineItems={editedInvoice.lineItems}
              currency={editedInvoice.currency}
              onLineItemDescriptionChange={onLineItemDescriptionChange}
              onLineItemQuantityChange={onLineItemQuantityChange}
              onLineItemRateChange={onLineItemRateChange}
              onLineItemDeleteClick={onLineItemDeleteClick}
              onLineItemAddClick={onLineItemAddClick}
            />
            <FormGroup>
              <ControlLabel>Notes</ControlLabel>
              <FormControl
                componentClass="textarea"
                placeholder="Notes - toute information pertinente non déjà couverte"
                value={editedInvoice.notes}
                onChange={onFieldValueChange.bind(this, 'notes')}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Terms</ControlLabel>
              <FormControl
                componentClass="textarea"
                placeholder="Conditions générales - frais de retard, modes de paiement, calendrier de livraison"
                value={editedInvoice.terms}
                onChange={onFieldValueChange.bind(this, 'Conditions')}
              />
            </FormGroup>
          </Form>
        </div>
        <div className="Footer-Container">
          <div className="Footer">
            <Col sm={2}>
              <Button onClick={onClearFormClick}>Effacer La Form</Button>
            </Col>
            <Col smOffset={8} sm={2}>
              <Button onClick={onSubmitClick} bsStyle="primary">
              Créer une facture
              </Button>
            </Col>
          </div>
        </div>
      </div>
      <div>
        <HistoryList
          historyStates={historyStates}
          onHistoryStateClick={onHistoryStateClick}
        />
      </div>
    </div>
  );
}

export default App;
