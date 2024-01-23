function parseFields(text) {
  const isFraudulentMatch = text.match(/\"isFraudulent\"\s*:\s*(true|false)/);
  const isFraudulent = isFraudulentMatch ? isFraudulentMatch[1] === 'true' : undefined;

  const reasoningMatch = text.match(/\"reasoning\"\s*:\s*\"([^\"]*\")/);
  const reasoning = reasoningMatch ? reasoningMatch[1] : undefined;

  return {
    isFraudulent, 
    reasoning
  };
}

function getTxnData(txn) {
  return "Transaction data: \n \
             merchant: " + txn.merchant + " \n \
             merchantAddress: " + txn.merchantAddress + "\n \
             date: " + txn.date + " \n \
             amount: " + txn.amount + " \n \
             currency: " + txn.currency + " \n \
             isInternational: " + txn.isInternational;
}

async function checkFraud(txn, model) {
    systemPrompt = "You are an expert at detecting credit card fraud. \
                  You are able to classify transactions as legitimate or fraudulent based on transaction data. \n \
                  The user will provide the transaction data with following fields: merchant, merchantAddress, date, amount, currency, isInternational. \
                  Respond in JSON format with two fields: \n \
                  isFraudulent - a boolean field to indicate whether the transaction is fraudulent \n \
                  reasoning - a string field explaining your reasoning."
    
             
    const response = await context.http.post({
    url: "https://demo.deployradiant.com/fraud-detector/openai/chat/completions",
    body: {
      messages: [
        {'role': 'system', 'content': systemPrompt },
        {'role': 'user', 'content': getTxnData(txn)}
        ],
      model: model
    },
    encodeBodyAsJSON: true
  })
  
  // // The response body is a BSON.Binary object.
  resp = EJSON.parse(response.body.text());
  return resp.choices[0].message.content
}

exports = async function(changeEvent) {
  
  txn = changeEvent.fullDocument

  model = 'gpt-3.5-turbo'
  resp = await checkFraud(txn, model)
  respJson = parseFields(resp)


  // model = 'mistral-medium'
  // resp = await checkFraud(txn, model)
  // respJson = parseFields(resp)
  
  
  // model = 'claude-2.1'
  // resp = await checkFraud(txn, model)
  // respJson = parseFields(resp)
  

  const serviceName = "arxivCluster0";
  const database = "finance";
  const collection = context.services.get(serviceName).db(database).collection("processedTransactions");
  
  collection.insertOne({"txnId": txn._id, "isFraudulent": respJson.isFraudulent, "reasoning": respJson.reasoning, "model": model})

};
