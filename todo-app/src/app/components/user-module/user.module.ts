import { NgModule } from "@angular/core";
import { UsersComponent } from "./users/users.component";
import { AdminComponent } from "./admin/admin.component";


@NgModule({
    imports:[UsersComponent,AdminComponent]
})
export class UserModule{

}