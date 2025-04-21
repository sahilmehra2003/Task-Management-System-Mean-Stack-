import { NgModule } from "@angular/core";
import { LoginComponent } from "./Login/login.component";
import { SignupComponent } from "./signup/signup.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MaterialModule } from "../../shared/materail.module";
import { MatFormFieldModule } from "@angular/material/form-field";
import { authRoutes } from "./auth.routes";
import { MaskEmailService } from "../../Services/utility/mask-email.service";

@NgModule({
    declarations:[
        LoginComponent,
        SignupComponent
    ],
    imports:[
        FormsModule,
        CommonModule,
        MaterialModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        RouterModule.forChild(authRoutes),
    ],
    providers:[
        {provide:MaskEmailService,useClass:MaskEmailService}
    ]
})
export class AuthModule{

}