import { Controller } from "./control";
import { IWorkItemLoadedArgs, IWorkItemFieldChangedArgs } from "TFS/WorkItemTracking/ExtensionContracts";
import { WorkItemFormService } from "TFS/WorkItemTracking/Services";

// save on ctr + s
// $(window).bind("keydown", function (event: JQueryEventObject) {
//     if (event.ctrlKey || event.metaKey) {
//         if (String.fromCharCode(event.which) === "S") {
//             event.preventDefault();
//             WorkItemFormService.getService().then((service) => service.beginSaveWorkItem($.noop, $.noop));
//         }
//     }
// });

var control: Controller;

var provider = () => {
    return {
        onLoaded: (workItemLoadedArgs: IWorkItemLoadedArgs) => {
            control = new Controller();
            VSS.resize(30, 30);
        },
    };
};

VSS.register(VSS.getContribution().id, provider);