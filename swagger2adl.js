// @ts-check

function convert(obj) {
    for (const modelName in obj) {
        convertDefinition(modelName, obj[modelName]);
    }
}

function convertDefinition(modelName, def) {
    if (def.description) {
        const match = def.description.match(/Schema of the Data property of an EventGridEvent for an? ([^ ]*) event/);

        if (match && match[1]) {
            console.log(`// @eventType("${match[1]}")`);
        }
    }

    console.log(`model ${modelName} {`)
    if (def.allOf) {
        for (const toSpread of def.allOf) {
            console.log(`    ...${getAdlType(toSpread)},`);
        }
    }
    for (const prop in def.properties) {
        if (def.properties[prop].description) {
            console.log(`    @doc("${def.properties[prop].description}")`);
        }
        console.log(`    ${prop}: ${getAdlType(def.properties[prop])},`)
    }       
    console.log(`}`)
    console.log();
}

function getAdlType(props) {
    if (props.$ref) {
        const match = props.$ref.match(/#\/definitions\/(.*)/)

        if (match && match[1]) 
        {
            return match[1];   
        }
    }

    if (props.type === "array") {
        return `${getAdlType(props.items)}[]`
    }

    if (props.type === "boolean") {
        return "boolean";
    }

    if (props.type === "string") {
        if (props.format === undefined) {
            return "string";
        }

        if (props.format == "date-time") {
            return "zonedDateTime";
        }

        if (props.format == "byte") {
            return "string /* NOTE(ellismg): this had `format: byte` */";
        }

        throw new Error(`unknown format format ${props.format} for string`);
    }

    if (props.type === "string") {
        return "string";
    }

    if (props.type === "integer") {
        return props.format ?? "int32"
    }

    if (props.type === "number") {
        return props.format ?? "float64"
    }

    // Feels bad, man.
    if (props.type === "object") {
        return "Map<string, string>"
    }

    throw new Error(`unknown type: ${props.type}`)
}

convert({
    "EventGridEvent": {
      "type": "object",
      "description": "Properties of an event published to an Event Grid topic using the EventGrid Schema.",
      "required": [
        "id",
        "subject",
        "data",
        "eventType",
        "eventTime",
        "dataVersion"
      ],
      "properties": {
        "id": {
          "description": "An unique identifier for the event.",
          "type": "string"
        },
        "topic": {
          "description": "The resource path of the event source.",
          "type": "string"
        },
        "subject": {
          "description": "A resource path relative to the topic path.",
          "type": "string"
        },
        "data": {
          "description": "Event data specific to the event type.",
          "type": "object"
        },
        "eventType": {
          "description": "The type of the event that occurred.",
          "type": "string"
        },
        "eventTime": {
          "description": "The time (in UTC) the event was generated.",
          "format": "date-time",
          "type": "string"
        },
        "metadataVersion": {
          "description": "The schema version of the event metadata.",
          "readOnly": true,
          "type": "string"
        },
        "dataVersion": {
          "description": "The schema version of the data object.",
          "type": "string"
        }
      }
    },
    "CloudEventEvent": {
      "type": "object",
      "description": "Properties of an event published to an Event Grid topic using the CloudEvent 1.0 Schema",
      "required": [
        "type",
        "specversion",
        "source",
        "id"
      ],
      "properties": {
        "id": {
          "description": "An identifier for the event. The combination of id and source must be unique for each distinct event.",
          "type": "string"
        },
        "source": {
          "description": "Identifies the context in which an event happened. The combination of id and source must be unique for each distinct event.",
          "type": "string"
        },
        "data": {
          "description": "Event data specific to the event type.",
          "type": "object"
        },
        "data_base64": {
          "description": "Event data specific to the event type, encoded as a base64 string.",
          "type": "string",
          "format": "byte"
        },
        "type": {
          "description": "Type of event related to the originating occurrence.",
          "type": "string"
        },
        "time": {
          "description": "The time (in UTC) the event was generated, in RFC3339 format.",
          "format": "date-time",
          "type": "string"
        },
        "specversion": {
          "description": "The version of the CloudEvents specification which the event uses.",
          "type": "string"
        },
        "dataschema": {
          "description": "Identifies the schema that data adheres to.",
          "type": "string"
        },
        "datacontenttype": {
          "description": "Content type of data value.",
          "type": "string"
        },
        "subject": {
          "description": "This describes the subject of the event in the context of the event producer (identified by source).",
          "type": "string"
        }
      },
      "additionalProperties": true
    },
    "CustomEventEvent": {
      "type": "object",
      "description": "Properties of an event published to an Event Grid topic using a custom schema"
    },
    "SubscriptionValidationEventData": {
      "description": "Schema of the Data property of an EventGridEvent for a Microsoft.EventGrid.SubscriptionValidationEvent.",
      "type": "object",
      "properties": {
        "validationCode": {
          "description": "The validation code sent by Azure Event Grid to validate an event subscription. To complete the validation handshake, the subscriber must either respond with this validation code as part of the validation response, or perform a GET request on the validationUrl (available starting version 2018-05-01-preview).",
          "type": "string",
          "readOnly": true
        },
        "validationUrl": {
          "description": "The validation URL sent by Azure Event Grid (available starting version 2018-05-01-preview). To complete the validation handshake, the subscriber must either respond with the validationCode as part of the validation response, or perform a GET request on the validationUrl (available starting version 2018-05-01-preview).",
          "type": "string",
          "readOnly": true
        }
      }
    },
    "SubscriptionValidationResponse": {
      "description": "To complete an event subscription validation handshake, a subscriber can use either the validationCode or the validationUrl received in a SubscriptionValidationEvent. When the validationCode is used, the SubscriptionValidationResponse can be used to build the response.",
      "type": "object",
      "properties": {
        "validationResponse": {
          "description": "The validation response sent by the subscriber to Azure Event Grid to complete the validation of an event subscription.",
          "type": "string"
        }
      }
    },
    "SubscriptionDeletedEventData": {
      "description": "Schema of the Data property of an EventGridEvent for a Microsoft.EventGrid.SubscriptionDeletedEvent.",
      "type": "object",
      "properties": {
        "eventSubscriptionId": {
          "description": "The Azure resource ID of the deleted event subscription.",
          "type": "string",
          "readOnly": true
        }
      }
    }
});