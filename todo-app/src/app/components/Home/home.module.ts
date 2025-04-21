import { NgModule } from "@angular/core";
import { RouterModule} from "@angular/router";
import { homeRoutes } from "./home.route";
import { HomeComponent } from "./home.component";
import { CommonModule, TitleCasePipe } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { MaterialModule } from "../../shared/materail.module";
import { NotificationComponent } from "../notification/notification.component";




@NgModule({
   declarations:[HomeComponent],
   imports: [
    CommonModule,
    MatMenuModule,
    TitleCasePipe,
    RouterModule.forChild(homeRoutes),
    RouterModule,
    MaterialModule,
    NotificationComponent
]
})

export class HomeModule{
}