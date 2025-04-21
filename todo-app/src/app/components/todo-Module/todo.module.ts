import { NgModule } from "@angular/core";
import { ProgressReportComponent } from "./progress-report/progress-report.component";
import { TodoComponent } from "./todo/todo.component";


@NgModule({
    imports:[TodoComponent,ProgressReportComponent]
})




export class TodoModule{

}