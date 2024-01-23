# MongoDB Atlas Triggers

Example functions to be used alongwith [MongoDB Atlas Triggers](https://www.mongodb.com/docs/atlas/app-services/triggers/). 


## Fraud Detector

The [fraudDetector.js](./fraudDetector.js) function can be used to set up a fraud detection workflow for credit card transactions. Set up a trigger for the "transactions" collection. The transactions should contain the following information - merchant name, merchant address, date of transaction, amount, currency and whether the transaction was international. 

This is then processed by an LLM to detect whether the transation is fraudulent. The result of determining whether the transaction was fraudulent is persisted in the "processedTransactions" collection along with the reasoning.

