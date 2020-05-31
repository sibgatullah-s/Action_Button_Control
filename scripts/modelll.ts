import { WorkItemFormService } from "TFS/WorkItemTracking/Services";
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import RestClient = require("TFS/WorkItemTracking/RestClient");

export class documentBuild {
    op: string;
    path: string;
    value: any;
}
export class Model {

    public buttonList: Array<string>;
    public fieldsList: Array<string>;
    private client: RestClient.WorkItemTrackingHttpClient4_1;
    private workItemType;

    constructor(dataTransfer, targetType, fieldsToCopy) {
        this.fieldsList = fieldsToCopy.split(",");
        let flag = false;
        this.fieldsList.forEach(element => {
            if (element == "System.TeamProject")
                flag = true;
        });
        if (flag == false)
            this.fieldsList.push("System.TeamProject");
        this.workItemType = targetType;
        this.buttonList = dataTransfer.split(",");
        this.client = RestClient.getClient();
    }

    public buttonPressed(pressed: string): void {
        switch (pressed) {
            case "Convert Work Item": {
                this.createNewWit()
                break;
            }
            case "Not a Bug": {
                this.notABug()
                break;
            }
            default: {
                alert(pressed + " not implamented yet")
            }
        }
    }
    private notABug() {
        WorkItemFormService.getService().then(
            (service) => {
                service.getFieldValues(this.fieldsList).then((values) => {
                    this.createNewWorkItem(values, true);
                })
            });
    }
    // convert to....
    private createNewWit() {
        WorkItemFormService.getService().then(
            (service) => {
                service.getFieldValues(this.fieldsList).then((values) => {
                    this.createNewWorkItem(values);
                })
            });
    }
    private createNewWorkItem(FieldsList: IDictionaryStringTo<Object>, closeTheSource: boolean = false) {
        let project: string = FieldsList["System.TeamProject"].toString();
        const id = FieldsList["System.Id"] ? FieldsList["System.Id"].toString() : '';
        let document: JsonPatchDocument;
        let tempDoc: Array<documentBuild> = [];
        // need to get the url
        this.fieldsList.forEach(element => {
            var x: documentBuild = { op: "add", path: "/fields/" + element, value: FieldsList[element] ? FieldsList[element].toString() : '' };
            tempDoc.push(x);
        });
        if (id != '') {
            this.client.getWorkItem(+id).then((workitem) => {
                tempDoc.push({ op: "add", path: "/relations/-", value: { rel: "System.LinkTypes.Hierarchy-Reverse", url: workitem } })
            }).then(() => {
                document = tempDoc;  // test the new use
                this.client.createWorkItem(document, project, this.workItemType).then((newWorkItem) => {
                    alert("new " + this.workItemType + " was created, ID number : " + newWorkItem.id);
                    if (closeTheSource)
                        this.closeStateSave();
                });
            })
        }
        else {
            document = tempDoc;  // test the new use
            this.client.createWorkItem(document, project, this.workItemType).then((newWorkItem) => {
                alert("new " + this.workItemType + " was created, ID number : " + newWorkItem.id);
                if (closeTheSource)
                    this.closeStateSave();
            });
        }
    }
    private closeStateSave() {
        WorkItemFormService.getService().then(
            (service) => {
                service.setFieldValue("System.State", "Closed").then(() => {
                    service.save;
                });
            });
    }

}